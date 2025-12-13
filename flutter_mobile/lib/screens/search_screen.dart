import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/api_service.dart';
import '../widgets/sitter_result_card.dart';

class SearchScreen extends StatefulWidget {
  final Map<String, dynamic>? searchParams;
  
  const SearchScreen({super.key, this.searchParams});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _apiService = ApiService();
  List<dynamic> _sitters = [];
  List<dynamic> _visibleSitters = [];
  bool _isLoading = false;
  String? _error;

  bool _isMapView = false;
  final MapController _mapController = MapController();

  // Base search params (from Home)
  String? _service;
  String? _location;
  double? _latitude;
  double? _longitude;

  // Filters (mirrors web portal)
  String _sortBy = 'distance'; // distance | price_low | price_high | rating
  RangeValues _priceRange = const RangeValues(0, 200);
  double _minRating = 0;
  double _maxDistance = 50;
  double _minExperience = 0;
  bool _verifiedOnly = false;
  bool _hasReviews = false;

  @override
  void dispose() {
    _mapController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    // Get search parameters from route
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final params = widget.searchParams ?? 
          (GoRouterState.of(context).extra as Map<String, dynamic>?);
      if (params != null) {
        _service = params['service'];
        _location = params['location'];
        _latitude = params['latitude']?.toDouble();
        _longitude = params['longitude']?.toDouble();
        _fetchWithCurrentFilters();
      }
    });
  }

  int _activeFilterCount() {
    int count = 0;
    if (_verifiedOnly) count++;
    if (_hasReviews) count++;
    if (_minRating > 0) count++;
    if (_minExperience > 0) count++;
    if (_maxDistance < 50) count++;
    if (_priceRange.start > 0 || _priceRange.end < 200) count++;
    return count;
  }

  double _getSitterMinPrice(Map<String, dynamic> sitter) {
    final services = sitter['services'] as Map<String, dynamic>?;
    if (services == null) return 25;
    double? minPrice;
    services.forEach((_, value) {
      if (value is Map && value['active'] == true) {
        final rate = (value['rate'] as num?)?.toDouble();
        if (rate != null) {
          minPrice = minPrice == null ? rate : (rate < minPrice! ? rate : minPrice);
        }
      }
    });
    return minPrice ?? 25;
  }

  double _getSitterRating(Map<String, dynamic> sitter) {
    final reviews = sitter['reviews'] as List?;
    if (reviews != null && reviews.isNotEmpty) {
      final total = reviews.fold<double>(0, (sum, r) => sum + ((r['rating'] as num?)?.toDouble() ?? 0));
      return total / reviews.length;
    }
    // Match web behavior: no reviews defaults to 5.0
    return 5.0;
  }

  double _getSitterDistance(Map<String, dynamic> sitter) {
    final d = sitter['distance'];
    if (d == null) return double.infinity;
    if (d is num) return d.toDouble();
    return double.tryParse(d.toString()) ?? double.infinity;
  }

  List<dynamic> _applySort(List<dynamic> sitters) {
    final sorted = [...sitters];
    sorted.sort((a, b) {
      final sa = (a as Map).cast<String, dynamic>();
      final sb = (b as Map).cast<String, dynamic>();
      switch (_sortBy) {
        case 'price_low':
          return _getSitterMinPrice(sa).compareTo(_getSitterMinPrice(sb));
        case 'price_high':
          return _getSitterMinPrice(sb).compareTo(_getSitterMinPrice(sa));
        case 'rating':
          return _getSitterRating(sb).compareTo(_getSitterRating(sa));
        case 'distance':
        default:
          return _getSitterDistance(sa).compareTo(_getSitterDistance(sb));
      }
    });
    return sorted;
  }

  Future<void> _fetchWithCurrentFilters() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final results = await _apiService.searchSitters(
        service: _service,
        location: _location,
        latitude: _latitude,
        longitude: _longitude,
        minPrice: _priceRange.start > 0 ? _priceRange.start : null,
        maxPrice: _priceRange.end < 200 ? _priceRange.end : null,
        minRating: _minRating > 0 ? _minRating : null,
        maxDistance: _maxDistance < 50 ? _maxDistance : null,
        minExperience: _minExperience > 0 ? _minExperience : null,
        verifiedOnly: _verifiedOnly ? true : null,
        hasReviews: _hasReviews ? true : null,
      );

      setState(() {
        _sitters = results;
        _visibleSitters = _applySort(results);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Search Results'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(_isMapView ? Icons.view_list_outlined : Icons.map_outlined),
            onPressed: () {
              setState(() {
                _isMapView = !_isMapView;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter Bar
          Container(
            height: 48,
            color: Colors.white,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _buildFilterChip(
                  label: _sortLabel(),
                  icon: Icons.sort,
                  active: _sortBy != 'distance',
                  onTap: _openSortSheet,
                ),
                _buildFilterChip(
                  label: _priceLabel(),
                  icon: null,
                  active: _priceRange.start > 0 || _priceRange.end < 200,
                  onTap: _openPriceSheet,
                ),
                _buildFilterChip(
                  label: _moreFiltersLabel(),
                  icon: Icons.tune,
                  active: _activeFilterCount() > 0,
                  onTap: _openMoreFiltersSheet,
                ),
              ],
            ),
          ),
          
          Expanded(
            child: _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFFF97316),
                    ),
                  )
                : _error != null
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.error_outline,
                              size: 64,
                              color: Colors.red,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Error: $_error',
                              style: const TextStyle(color: Colors.red),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton(
                              onPressed: () => context.go('/home'),
                              child: const Text('Go Back'),
                            ),
                          ],
                        ),
                      )
                    : _sitters.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: Colors.grey,
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'No sitters found',
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Try adjusting your search criteria',
                                  style: TextStyle(color: Colors.grey.shade600),
                                ),
                                const SizedBox(height: 24),
                                ElevatedButton(
                                  onPressed: () => context.go('/home'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFFF97316),
                                    foregroundColor: Colors.white,
                                  ),
                                  child: const Text('New Search'),
                                ),
                              ],
                            ),
                          )
                        : _isMapView
                            ? _buildMapView()
                            : ListView.builder(
                                padding: const EdgeInsets.all(16),
                                itemCount: _visibleSitters.length,
                                itemBuilder: (context, index) {
                                  final sitter = _visibleSitters[index];
                                  return SitterResultCard(sitter: sitter);
                                },
                              ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapView() {
    final markers = _visibleSitters
        .map((s) => (s as Map).cast<String, dynamic>())
        .where((s) => (s['latitude'] != null && s['longitude'] != null))
        .map((s) {
          final lat = (s['latitude'] as num).toDouble();
          final lng = (s['longitude'] as num).toDouble();
          return Marker(
            point: LatLng(lat, lng),
            width: 52,
            height: 52,
            child: GestureDetector(
              onTap: () => _openSitterPreview(s),
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF97316),
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.2),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: const Icon(Icons.pets, color: Colors.white, size: 22),
              ),
            ),
          );
        })
        .toList();

    final hasMarkers = markers.isNotEmpty;
    final initialCenter = _getInitialMapCenter(markers);

    return Stack(
      children: [
        FlutterMap(
          mapController: _mapController,
          options: MapOptions(
            initialCenter: initialCenter,
            initialZoom: hasMarkers ? 12 : 3,
            interactionOptions: const InteractionOptions(flags: InteractiveFlag.all),
          ),
          children: [
            TileLayer(
              urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
              userAgentPackageName: 'double_paws',
            ),
            if (hasMarkers) MarkerLayer(markers: markers),
          ],
        ),

        if (!hasMarkers)
          Center(
            child: Container(
              margin: const EdgeInsets.symmetric(horizontal: 24),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 14,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.location_off_outlined, size: 40, color: Color(0xFFF97316)),
                  const SizedBox(height: 10),
                  const Text(
                    'No sitter locations available',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Try expanding distance or refining your search.',
                    style: TextStyle(color: Colors.grey.shade600),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),
          ),

        // Bottom draggable list for quick browsing (map + list in one view)
        if (_visibleSitters.isNotEmpty)
          DraggableScrollableSheet(
            initialChildSize: 0.22,
            minChildSize: 0.12,
            maxChildSize: 0.72,
            builder: (context, controller) {
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.12),
                      blurRadius: 16,
                      offset: const Offset(0, -4),
                    ),
                  ],
                ),
                child: Column(
                  children: [
                    const SizedBox(height: 8),
                    Container(
                      width: 44,
                      height: 5,
                      decoration: BoxDecoration(
                        color: Colors.grey.shade300,
                        borderRadius: BorderRadius.circular(999),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            '${_visibleSitters.length} sitters',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          TextButton(
                            onPressed: () => setState(() => _isMapView = false),
                            child: const Text('List view'),
                          ),
                        ],
                      ),
                    ),
                    const Divider(height: 1),
                    Expanded(
                      child: ListView.builder(
                        controller: controller,
                        itemCount: _visibleSitters.length,
                        itemBuilder: (context, index) {
                          final sitter = (_visibleSitters[index] as Map).cast<String, dynamic>();
                          return _SitterMapListTile(
                            sitter: sitter,
                            price: _getSitterMinPrice(sitter),
                            rating: _getSitterRating(sitter),
                            distanceKm: _getSitterDistance(sitter),
                            onTap: () {
                              final lat = sitter['latitude'];
                              final lng = sitter['longitude'];
                              if (lat is num && lng is num) {
                                _mapController.move(LatLng(lat.toDouble(), lng.toDouble()), 14);
                              }
                              _openSitterPreview(sitter);
                            },
                          );
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
      ],
    );
  }

  LatLng _getInitialMapCenter(List<Marker> markers) {
    if (_latitude != null && _longitude != null) {
      return LatLng(_latitude!, _longitude!);
    }
    if (markers.isNotEmpty) {
      final avgLat = markers.map((m) => m.point.latitude).reduce((a, b) => a + b) / markers.length;
      final avgLng = markers.map((m) => m.point.longitude).reduce((a, b) => a + b) / markers.length;
      return LatLng(avgLat, avgLng);
    }
    return const LatLng(40.7128, -74.0060); // fallback: NYC
  }

  void _openSitterPreview(Map<String, dynamic> sitter) {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: SingleChildScrollView(
            child: SitterResultCard(sitter: sitter),
          ),
        ),
      ),
    );
  }

  String _sortLabel() {
    switch (_sortBy) {
      case 'price_low':
        return 'Price: Low';
      case 'price_high':
        return 'Price: High';
      case 'rating':
        return 'Rating';
      case 'distance':
      default:
        return 'Sort by';
    }
  }

  String _priceLabel() {
    if (_priceRange.start == 0 && _priceRange.end == 200) return 'Price';
    return '\$${_priceRange.start.round()}-\$${_priceRange.end.round()}';
  }

  String _moreFiltersLabel() {
    final c = _activeFilterCount();
    return c == 0 ? 'More filters' : 'Filters ($c)';
  }

  Future<void> _openSortSheet() async {
    final selected = await showModalBottomSheet<String>(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _SortSheet(current: _sortBy),
    );
    if (!mounted || selected == null) return;
    setState(() {
      _sortBy = selected;
      _visibleSitters = _applySort(_sitters);
    });
  }

  Future<void> _openPriceSheet() async {
    final selected = await showModalBottomSheet<RangeValues>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _PriceSheet(current: _priceRange),
    );
    if (!mounted || selected == null) return;
    setState(() {
      _priceRange = selected;
    });
    await _fetchWithCurrentFilters();
  }

  Future<void> _openMoreFiltersSheet() async {
    final selected = await showModalBottomSheet<_MoreFiltersResult>(
      context: context,
      showDragHandle: true,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (_) => _MoreFiltersSheet(
        minRating: _minRating,
        maxDistance: _maxDistance,
        minExperience: _minExperience,
        verifiedOnly: _verifiedOnly,
        hasReviews: _hasReviews,
        onClear: () => Navigator.of(context).pop(
          const _MoreFiltersResult(
            minRating: 0,
            maxDistance: 50,
            minExperience: 0,
            verifiedOnly: false,
            hasReviews: false,
          ),
        ),
      ),
    );
    if (!mounted || selected == null) return;
    setState(() {
      _minRating = selected.minRating;
      _maxDistance = selected.maxDistance;
      _minExperience = selected.minExperience;
      _verifiedOnly = selected.verifiedOnly;
      _hasReviews = selected.hasReviews;
    });
    await _fetchWithCurrentFilters();
  }

  Widget _buildFilterChip({
    required String label,
    IconData? icon,
    required bool active,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.only(right: 8, bottom: 8, top: 2), // Small vertical margin
      child: FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: active ? const Color(0xFFF97316) : Colors.grey.shade700),
              const SizedBox(width: 4),
            ],
            Text(label),
            const SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 16, color: active ? const Color(0xFFF97316) : Colors.grey.shade700),
          ],
        ),
        backgroundColor: active ? const Color(0xFFFFF7ED) : Colors.white,
        side: BorderSide(color: active ? const Color(0xFFF97316) : Colors.grey.shade300),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onSelected: (_) => onTap(),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}

class _SitterMapListTile extends StatelessWidget {
  final Map<String, dynamic> sitter;
  final double price;
  final double rating;
  final double distanceKm;
  final VoidCallback onTap;

  const _SitterMapListTile({
    required this.sitter,
    required this.price,
    required this.rating,
    required this.distanceKm,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final user = (sitter['user'] as Map?)?.cast<String, dynamic>() ?? {};
    final firstName = user['firstName']?.toString() ?? 'Sitter';
    final lastName = user['lastName']?.toString() ?? '';
    final subtitle = sitter['headline']?.toString() ?? 'Loving Pet Sitter';

    final distanceText = distanceKm.isFinite ? '${distanceKm.toStringAsFixed(1)} km' : '';

    return ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: const Color(0xFFF97316).withOpacity(0.12),
        child: Text(
          firstName.isNotEmpty ? firstName[0].toUpperCase() : 'S',
          style: const TextStyle(color: Color(0xFFF97316), fontWeight: FontWeight.bold),
        ),
      ),
      title: Text('$firstName $lastName', maxLines: 1, overflow: TextOverflow.ellipsis),
      subtitle: Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis),
      trailing: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Text(
            '\$${price.toStringAsFixed(0)}/night',
            style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFFF97316)),
          ),
          const SizedBox(height: 2),
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.star_rounded, size: 16, color: Color(0xFFEAB308)),
              const SizedBox(width: 2),
              Text(rating.toStringAsFixed(1)),
              if (distanceText.isNotEmpty) ...[
                const SizedBox(width: 8),
                Text(distanceText, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

class _SortSheet extends StatelessWidget {
  final String current;
  const _SortSheet({required this.current});

  @override
  Widget build(BuildContext context) {
    final options = const <Map<String, String>>[
      {'value': 'distance', 'label': '📍 Distance'},
      {'value': 'price_low', 'label': '💰 Price: Low to High'},
      {'value': 'price_high', 'label': '💎 Price: High to Low'},
      {'value': 'rating', 'label': '⭐ Rating'},
    ];
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Sort by',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...options.map((o) {
              final v = o['value']!;
              return RadioListTile<String>(
                value: v,
                groupValue: current,
                activeColor: const Color(0xFFF97316),
                title: Text(o['label']!),
                onChanged: (val) => Navigator.of(context).pop(val),
              );
            }),
          ],
        ),
      ),
    );
  }
}

class _PriceSheet extends StatefulWidget {
  final RangeValues current;
  const _PriceSheet({required this.current});

  @override
  State<_PriceSheet> createState() => _PriceSheetState();
}

class _PriceSheetState extends State<_PriceSheet> {
  late RangeValues _value;

  @override
  void initState() {
    super.initState();
    _value = widget.current;
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 8, 16, 16 + MediaQuery.of(context).viewInsets.bottom),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Price', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text(
              '\$${_value.start.round()} - \$${_value.end.round()}',
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFFF97316)),
            ),
            RangeSlider(
              values: _value,
              min: 0,
              max: 200,
              divisions: 40, // step 5
              activeColor: const Color(0xFFF97316),
              labels: RangeLabels('\$${_value.start.round()}', '\$${_value.end.round()}'),
              onChanged: (v) => setState(() => _value = v),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => setState(() => _value = const RangeValues(0, 200)),
                    child: const Text('Reset'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF97316),
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () => Navigator.of(context).pop(_value),
                    child: const Text('Apply'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MoreFiltersResult {
  final double minRating;
  final double maxDistance;
  final double minExperience;
  final bool verifiedOnly;
  final bool hasReviews;

  const _MoreFiltersResult({
    required this.minRating,
    required this.maxDistance,
    required this.minExperience,
    required this.verifiedOnly,
    required this.hasReviews,
  });
}

class _MoreFiltersSheet extends StatefulWidget {
  final double minRating;
  final double maxDistance;
  final double minExperience;
  final bool verifiedOnly;
  final bool hasReviews;
  final VoidCallback onClear;

  const _MoreFiltersSheet({
    required this.minRating,
    required this.maxDistance,
    required this.minExperience,
    required this.verifiedOnly,
    required this.hasReviews,
    required this.onClear,
  });

  @override
  State<_MoreFiltersSheet> createState() => _MoreFiltersSheetState();
}

class _MoreFiltersSheetState extends State<_MoreFiltersSheet> {
  late double _minRating;
  late double _maxDistance;
  late double _minExperience;
  late bool _verifiedOnly;
  late bool _hasReviews;

  @override
  void initState() {
    super.initState();
    _minRating = widget.minRating;
    _maxDistance = widget.maxDistance;
    _minExperience = widget.minExperience;
    _verifiedOnly = widget.verifiedOnly;
    _hasReviews = widget.hasReviews;
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: EdgeInsets.fromLTRB(16, 8, 16, 16 + MediaQuery.of(context).viewInsets.bottom),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('More filters', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  TextButton(onPressed: widget.onClear, child: const Text('Clear')),
                ],
              ),
              const SizedBox(height: 12),

              const Text('Minimum rating', style: TextStyle(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: [0, 3, 4, 4.5, 5].map((r) {
                  final rr = r.toDouble();
                  final selected = _minRating == rr;
                  return ChoiceChip(
                    selected: selected,
                    label: Text(rr == 0 ? 'Any' : '${rr}+'),
                    selectedColor: const Color(0xFFFFF7ED),
                    side: BorderSide(color: selected ? const Color(0xFFF97316) : Colors.grey.shade300),
                    onSelected: (_) => setState(() => _minRating = rr),
                  );
                }).toList(),
              ),

              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Max distance', style: TextStyle(fontWeight: FontWeight.w600)),
                  Text('${_maxDistance.round()} km', style: TextStyle(color: Colors.grey.shade700)),
                ],
              ),
              Slider(
                value: _maxDistance,
                min: 5,
                max: 100,
                divisions: 19,
                activeColor: const Color(0xFFF97316),
                onChanged: (v) => setState(() => _maxDistance = v),
              ),

              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Min experience', style: TextStyle(fontWeight: FontWeight.w600)),
                  Text('${_minExperience.round()} yrs', style: TextStyle(color: Colors.grey.shade700)),
                ],
              ),
              Slider(
                value: _minExperience,
                min: 0,
                max: 10,
                divisions: 10,
                activeColor: const Color(0xFFF97316),
                onChanged: (v) => setState(() => _minExperience = v),
              ),

              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _verifiedOnly,
                activeColor: const Color(0xFFF97316),
                title: const Text('Verified sitters only'),
                onChanged: (v) => setState(() => _verifiedOnly = v),
              ),
              SwitchListTile(
                contentPadding: EdgeInsets.zero,
                value: _hasReviews,
                activeColor: const Color(0xFFF97316),
                title: const Text('Has reviews'),
                onChanged: (v) => setState(() => _hasReviews = v),
              ),

              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(
                        const _MoreFiltersResult(
                          minRating: 0,
                          maxDistance: 50,
                          minExperience: 0,
                          verifiedOnly: false,
                          hasReviews: false,
                        ),
                      ),
                      child: const Text('Reset'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFF97316),
                        foregroundColor: Colors.white,
                      ),
                      onPressed: () => Navigator.of(context).pop(
                        _MoreFiltersResult(
                          minRating: _minRating,
                          maxDistance: _maxDistance,
                          minExperience: _minExperience,
                          verifiedOnly: _verifiedOnly,
                          hasReviews: _hasReviews,
                        ),
                      ),
                      child: const Text('Apply'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
