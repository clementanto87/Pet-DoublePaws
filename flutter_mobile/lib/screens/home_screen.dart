import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/paw_logo.dart';
import '../widgets/location_autocomplete.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  String? _selectedService;
  final _locationController = TextEditingController();
  final _apiService = ApiService();
  bool _isSearching = false;
  LocationSuggestion? _selectedLocation;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    
    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeIn),
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOutCubic),
    );
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _handleSearch() async {
    if (_selectedService == null && _locationController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Please select a service or enter a location'),
          backgroundColor: const Color(0xFFF97316),
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
      );
      return;
    }

    setState(() {
      _isSearching = true;
    });

    try {
      final location = _locationController.text.trim();
      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 300));
        context.push('/search', extra: {
          'service': _selectedService,
          'location': location.isEmpty ? null : location,
          'latitude': _selectedLocation?.latitude,
          'longitude': _selectedLocation?.longitude,
        });
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSearching = false;
        });
      }
    }
  }

  void _onLocationSelected(LocationSuggestion location) {
    setState(() {
      _selectedLocation = location;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;
    final firstName = user?['firstName'] ?? 'there';
    final media = MediaQuery.of(context);
    // Compact mode keeps the search box + CTA visible on smaller devices without scrolling.
    final isCompact = media.size.height < 760;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              const Color(0xFFFFF7ED),
              Colors.white,
              Colors.white,
            ],
            stops: const [0.0, 0.3, 1.0],
          ),
        ),
        child: SafeArea(
          child: FadeTransition(
            opacity: _fadeAnimation,
            child: SlideTransition(
              position: _slideAnimation,
                child: ListView(
                  physics: const BouncingScrollPhysics(),
                  children: [
                    // Enhanced Header (always visible)
                    _buildHeader(context, firstName),

                    SizedBox(height: isCompact ? 6 : 8),

                    // Content: headline + search
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildWelcomeSection(firstName),
                          SizedBox(height: isCompact ? 14 : 20),
                          _buildSearchBox(compact: isCompact),
                        ],
                      ),
                    ),

                    // Scrollable extras (Trust + Features)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
                      child: Column(
                        children: [
                          _buildTrustSection(),
                          const SizedBox(height: 28),
                          _buildFeaturesSection(),
                          const SizedBox(height: 40),
                        ],
                      ),
                    ),
                  ],
                ),
            ),
          ),
        ),
      ),
    );
  }



  Widget _buildSearchBox({required bool compact}) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(compact ? 16 : 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFFF97316),
          width: 2,
        ),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFFF97316).withOpacity(0.1),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Service Selection Header
          Row(
            children: [
              const Icon(
                Icons.pets, // Or a target icon if preferred
                color: Color(0xFFF97316), // Using Theme color might be better but harcoding for safety
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'What service does your pet need?',
                style: TextStyle(
                  fontSize: compact ? 14 : 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
          SizedBox(height: compact ? 12 : 16),
          
          // Services (compact uses horizontal list to save vertical space)
          compact ? _buildServiceList() : _buildServicesGrid(compact: compact),
          
          SizedBox(height: compact ? 16 : 24),
          
          // Location Section Divider / Header
          Divider(height: compact ? 24 : 32),
           Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                color: Color(0xFFF97316),
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Where do you need pet care?',
                style: TextStyle(
                  fontSize: compact ? 14 : 15,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade700,
                ),
              ),
            ],
          ),
          SizedBox(height: compact ? 10 : 12),
          
          // Location Input with Autocomplete
          LocationAutocomplete(
            controller: _locationController,
            hintText: 'Try "New York, NY"...',
            prefixIcon: Icons.location_on_outlined,
            suffixIcon: Icons.near_me_outlined,
            onLocationSelected: _onLocationSelected,
            onSuffixTap: () async {
              // Handle location auto-detect using geolocator
              try {
                // You can implement geolocator here if needed
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Location detection coming soon'),
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Error: ${e.toString()}'),
                    backgroundColor: Colors.red,
                    behavior: SnackBarBehavior.floating,
                  ),
                );
              }
            },
          ),
          
          SizedBox(height: compact ? 16 : 24),
          
          // Search Button (Full Width)
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _isSearching ? null : _handleSearch,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFF97316),
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: compact ? 14 : 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30),
                ),
                elevation: 0,
              ),
              child: _isSearching
                  ? const SizedBox(
                      height: 24,
                      width: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.search, size: 24),
                        SizedBox(width: 8),
                        Text(
                          'Search Sitters',
                          style: TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(width: 4),
                        Icon(Icons.arrow_forward, size: 20),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServicesGrid({required bool compact}) {
    final services = [
      {
        'id': 'boarding',
        'icon': Icons.home_rounded,
        'title': 'Boarding',
        'desc': 'Overnight stay',
      },
      {
        'id': 'housesitting',
        'icon': Icons.house_rounded,
        'title': 'House Sitting',
        'desc': 'At your home',
      },
      {
        'id': 'visits',
        'icon': Icons.wb_sunny_rounded,
        'title': 'Drop-In Visits',
        'desc': 'Check-ins',
      },
      {
        'id': 'daycare',
        'icon': Icons.pets_rounded,
        'title': 'Doggy Day Care',
        'desc': 'Daytime care',
      },
      {
        'id': 'walking',
        'icon': Icons.directions_walk_rounded,
        'title': 'Dog Walking',
        'desc': 'Regular walks',
      },
    ];

    // Split services into two rows: 3 then 2
    final firstRow = services.sublist(0, 3);
    final secondRow = services.sublist(3, 5);

    return Column(
      children: [
        Row(
          children: firstRow.map((s) => Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _buildServiceItem(s),
            ),
          )).toList(),
        ),
        SizedBox(height: compact ? 10 : 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: secondRow.map((s) => SizedBox(
            width: (MediaQuery.of(context).size.width - 80) / 3, // Approximate width to align with top items
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: _buildServiceItem(s),
            ),
          )).toList(),
        ),
      ],
    );
  }

  Widget _buildServiceItem(Map<String, dynamic> service) {
    final isSelected = _selectedService == service['id'];
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedService = service['id'] as String;
        });
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        height: 104, // Slightly shorter to reduce vertical footprint
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFF97316) : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? const Color(0xFFF97316) : Colors.transparent,
            width: 1,
          ),
          boxShadow: isSelected
             ? [
                 BoxShadow(
                   color: const Color(0xFFF97316).withOpacity(0.3),
                   blurRadius: 8,
                   offset: const Offset(0, 4),
                 )
               ] 
             : [],
        ),
        child: Stack(
          children: [
             Column(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Icon(
                  service['icon'] as IconData,
                  size: 26,
                  color: isSelected ? Colors.white : const Color(0xFFF97316),
                ),
                Flexible(
                  child: Text(
                    service['title'] as String,
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                      height: 1.1,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                 Flexible(
                  child: Text(
                    service['desc'] as String,
                    style: TextStyle(
                      fontSize: 9,
                      color: isSelected ? Colors.white.withOpacity(0.9) : Colors.grey.shade500,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            if (isSelected) 
              Positioned(
                top: 0,
                right: 0,
                child: Icon(
                  Icons.check_circle,
                  color: Colors.white,
                  size: 16,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String firstName) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 8, 20, 8), // Reduced vertical padding
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(6), // Reduced padding
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.05),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: const PawLogo(size: 24), // Smaller logo
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Hi, $firstName! 👋',
                    style: const TextStyle(
                      fontSize: 16, // Smaller font
                      fontWeight: FontWeight.bold,
                      color: Colors.black87,
                    ),
                  ),
                ],
              ),
            ],
          ),
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: IconButton(
              icon: const Icon(Icons.account_circle_outlined),
              iconSize: 24, // Smaller icon
              padding: const EdgeInsets.all(4), // Smaller touch target padding visually
              constraints: const BoxConstraints(), // Tighter constraints
              color: const Color(0xFFF97316),
              onPressed: () => context.go('/profile'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeSection(String firstName) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Tagline Banner - Made much more compact
        Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                const Color(0xFFF97316).withOpacity(0.1),
                const Color(0xFFF97316).withOpacity(0.05),
              ],
            ),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: const Color(0xFFF97316).withOpacity(0.2),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.star, size: 14, color: Color(0xFFF97316)),
              const SizedBox(width: 6),
              const Text(
                'Trusted Pet Care, Made Simple',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFFF97316),
                ),
              ),
              const SizedBox(width: 6),
              const Icon(Icons.star, size: 14, color: Color(0xFFF97316)),
            ],
          ),
        ),

        const SizedBox(height: 12), // Reduced spacing

        // Main Headline - Significantly smaller to fit screen
        RichText(
          text: const TextSpan(
            style: TextStyle(
              fontSize: 26, // Reduced from 36
              fontWeight: FontWeight.bold,
              height: 1.1,
            ),
            children: [
              TextSpan(
                text: 'Find Your Pet\'s ',
                style: TextStyle(color: Colors.black87),
              ),
              TextSpan(
                text: 'Perfect Sitter',
                style: TextStyle(color: Color(0xFFF97316)),
              ),
            ],
          ),
        ),
        
        // Removed subtitle to save vertical space as requested "search bar seeing right away"
      ],
    );
  }

  Widget _buildTrustSection() {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            _buildTrustBadge(
              Icons.verified_user,
              'Background\nChecked',
              Colors.green,
            ),
            _buildTrustBadge(
              Icons.shield,
              'Pet Insurance\nIncluded',
              Colors.blue,
            ),
            _buildTrustBadge(
              Icons.headset_mic,
              '24/7\nSupport',
              Colors.purple,
            ),
          ],
        ),
        const SizedBox(height: 8),
      ],
    );
  }

  Widget _buildFeaturesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Why Choose Us?',
          style: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),
        const SizedBox(height: 16),
        _buildFeatureItem(
          Icons.star_rounded,
          'Top-Rated Sitters',
          'All sitters are verified and highly rated by pet parents',
          Colors.amber,
        ),
        const SizedBox(height: 12),
        _buildFeatureItem(
          Icons.security,
          'Fully Insured',
          'Every booking includes comprehensive pet insurance coverage',
          Colors.blue,
        ),
        const SizedBox(height: 12),
        _buildFeatureItem(
          Icons.favorite,
          'Loving Care',
          'Your pets receive the same love and attention as at home',
          Colors.pink,
        ),
      ],
    );
  }

  Widget _buildFeatureItem(IconData icon, String title, String description, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceList() {
    final services = [
      {
        'id': 'boarding',
        'icon': Icons.home_rounded,
        'title': 'Boarding',
      },
      {
        'id': 'housesitting',
        'icon': Icons.house_rounded,
        'title': 'House Sitting',
      },
      {
        'id': 'daycare',
        'icon': Icons.pets_rounded,
        'title': 'Day Care',
      },
      {
        'id': 'walking',
        'icon': Icons.directions_walk_rounded,
        'title': 'Walking',
      },
      {
        'id': 'visits',
        'icon': Icons.wb_sunny_rounded,
        'title': 'Drop-In',
      },
    ];

    return SizedBox(
      height: 100,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: services.length,
        separatorBuilder: (context, index) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final service = services[index];
          final isSelected = _selectedService == service['id'];

          return GestureDetector(
            onTap: () {
              setState(() {
                _selectedService = service['id'] as String;
              });
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 90,
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFF97316) : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? const Color(0xFFF97316)
                      : Colors.grey.shade200,
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isSelected
                        ? const Color(0xFFF97316).withOpacity(0.3)
                        : Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    service['icon'] as IconData,
                    size: 32,
                    color: isSelected ? Colors.white : const Color(0xFFF97316),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    service['title'] as String,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (isSelected) ...[
                    const SizedBox(height: 4),
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildTrustBadge(IconData icon, String text, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: color, size: 26),
        ),
        const SizedBox(height: 10),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Colors.grey.shade700,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Widget _buildFooterFeature(IconData icon, String text) {
    return Column(
      children: [
        Icon(
          icon,
          color: const Color(0xFFF97316),
          size: 30,
        ),
        const SizedBox(height: 8),
        Text(
          text,
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: Color(0xFFF97316),
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}
