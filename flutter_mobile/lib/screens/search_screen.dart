import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
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
  bool _isLoading = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    // Get search parameters from route
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final params = widget.searchParams ?? 
          (GoRouterState.of(context).extra as Map<String, dynamic>?);
      if (params != null) {
        _performSearch(
          service: params['service'],
          location: params['location'],
          latitude: params['latitude']?.toDouble(),
          longitude: params['longitude']?.toDouble(),
        );
      }
    });
  }

  Future<void> _performSearch({
    String? service,
    String? location,
    double? latitude,
    double? longitude,
  }) async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final results = await _apiService.searchSitters(
        service: service,
        location: location,
        latitude: latitude,
        longitude: longitude,
      );

      setState(() {
        _sitters = results;
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
            icon: const Icon(Icons.map_outlined),
            onPressed: () {},
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
                _buildFilterChip('Sort by', Icons.sort, true),
                _buildFilterChip('Price', null, false),
                _buildFilterChip('More filters', Icons.tune, false),
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
                        : ListView.builder(
                            padding: const EdgeInsets.all(16),
                            itemCount: _sitters.length,
                            itemBuilder: (context, index) {
                              final sitter = _sitters[index];
                              return SitterResultCard(sitter: sitter);
                            },
                          ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, IconData? icon, bool active) {
    return Container(
      margin: const EdgeInsets.only(right: 8, bottom: 8, top: 2), // Small vertical margin
      child: FilterChip(
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 16, color: Colors.grey.shade700),
              const SizedBox(width: 4),
            ],
            Text(label),
            const SizedBox(width: 4),
            Icon(Icons.keyboard_arrow_down, size: 16, color: Colors.grey.shade700),
          ],
        ),
        backgroundColor: Colors.white,
        side: BorderSide(color: Colors.grey.shade300),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        onSelected: (val) {},
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
        visualDensity: VisualDensity.compact,
      ),
    );
  }
}
