import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class BookingProcessScreen extends StatefulWidget {
  final Map<String, dynamic> sitter;
  final Map<String, dynamic>? booking;

  const BookingProcessScreen({
    super.key, 
    required this.sitter,
    this.booking,
  });

  @override
  State<BookingProcessScreen> createState() => _BookingProcessScreenState();
}

class _BookingProcessScreenState extends State<BookingProcessScreen> {
  DateTimeRange? _selectedDateRange;
  TimeOfDay _startTime = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _endTime = const TimeOfDay(hour: 17, minute: 0);
  String _selectedService = 'boarding';
  int _dogCount = 0;
  int _catCount = 0;
  final _messageController = TextEditingController();
  
  // Master list of services with backend keys
  final List<Map<String, dynamic>> _allServices = [
    {'id': 'boarding', 'label': 'Boarding', 'icon': Icons.home, 'backendKey': 'boarding'},
    {'id': 'house-sitting', 'label': 'House Sitting', 'icon': Icons.bedroom_parent, 'backendKey': 'houseSitting'},
    {'id': 'drop-in', 'label': 'Drop-in Visits', 'icon': Icons.wb_sunny, 'backendKey': 'dropInVisits'},
    {'id': 'day-care', 'label': 'Doggy Day Care', 'icon': Icons.pets, 'backendKey': 'doggyDayCare'},
    {'id': 'walking', 'label': 'Dog Walking', 'icon': Icons.directions_walk, 'backendKey': 'dogWalking'},
  ];

  // List to store only available services for this sitter
  List<Map<String, dynamic>> _availableServices = [];

  @override
  void initState() {
    super.initState();
    _filterAvailableServices();
    
    // If we have a pre-filled booking, use that data
    if (widget.booking != null) {
      _initializeFromBooking();
    } else {
      // Default selection to first available service if possible
      if (_availableServices.isNotEmpty && !_availableServices.any((s) => s['id'] == _selectedService)) {
        _selectedService = _availableServices.first['id'];
      }
    }
  }

  void _filterAvailableServices() {
    final sitterServices = widget.sitter['services'] as Map<String, dynamic>? ?? {};
    
    _availableServices = _allServices.where((service) {
      final backendKey = service['backendKey'];
      final serviceData = sitterServices[backendKey] as Map<String, dynamic>?;
      // Check if service exists and is active
      return serviceData != null && serviceData['active'] == true;
    }).toList();
  }

  void _initializeFromBooking() {
    final b = widget.booking!;
    // Dates
    if (b['startDate'] != null && b['endDate'] != null) {
      _selectedDateRange = DateTimeRange(
        start: DateTime.parse(b['startDate']),
        end: DateTime.parse(b['endDate']),
      );
    }
    // Constants for demo - in real app, parse from booking
    _selectedService = b['service']?.toString().toLowerCase().replaceAll(' ', '-') ?? 'boarding';
    
    // If filtered services list is not empty and selected service isn't in it, fallback
    if (_availableServices.isNotEmpty && !_availableServices.any((s) => s['id'] == _selectedService)) {
       _selectedService = _availableServices.first['id'];
    }
    
    // Assume booking data has pets/message
    _dogCount = b['dogCount'] ?? 1;
    _catCount = b['catCount'] ?? 0;
    _messageController.text = b['message'] ?? '';
  }

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    final user = widget.sitter['user'] ?? {};
    final firstName = user['firstName'] ?? 'Sitter';
    final services = widget.sitter['services'] as Map<String, dynamic>? ?? {};
    
    // Find current service object to get backend key
    final currentServiceObj = _allServices.firstWhere(
      (s) => s['id'] == _selectedService, 
      orElse: () => _allServices.first
    );
    final backendServiceKey = currentServiceObj['backendKey'];
    
    final serviceData = services[backendServiceKey] as Map<String, dynamic>?;
    final priceInt = (serviceData?['rate'] as num?)?.toInt() ?? 30; // Default 30 if not found
    
    // Calculate nights
    int totalNights = 0;
    if (_selectedDateRange != null) {
      totalNights = _selectedDateRange!.duration.inDays;
      if (totalNights == 0) totalNights = 1; 
    }
    
    // Calculate total params
    final totalPets = _dogCount + _catCount;
    final petMultiplier = totalPets > 1 ? 1 + (totalPets - 1) * 0.5 : 1;
    final basePrice = totalNights * priceInt;
    final totalPrice = (basePrice * petMultiplier).round();

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.booking != null ? 'Edit Booking' : 'Request Booking'),
        backgroundColor: Colors.white,
        foregroundColor: Colors.black,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sitter Summary
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: const Color(0xFFF97316).withOpacity(0.1),
                    child: Text(
                      firstName.isNotEmpty ? firstName[0].toUpperCase() : 'S',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: Color(0xFFF97316),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Booking with $firstName',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        _allServices.firstWhere((s) => s['id'] == _selectedService, orElse: () => _allServices.first)['label'],
                        style: TextStyle(color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: 24),
            
            // 1. Service Selection
            const Text(
              'Service',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            
            if (_availableServices.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  children: [
                    Icon(Icons.info_outline, color: Colors.grey),
                    SizedBox(width: 8),
                    Expanded(child: Text('This sitter has no active services listed.')),
                  ],
                ),
              )
            else
            SizedBox(
              height: 100,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _availableServices.length,
                separatorBuilder: (_, __) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final service = _availableServices[index];
                  final isSelected = _selectedService == service['id'];
                  return GestureDetector(
                    onTap: () => setState(() => _selectedService = service['id']),
                    child: Container(
                      width: 100,
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFFF97316).withOpacity(0.1) : Colors.white,
                        border: Border.all(
                          color: isSelected ? const Color(0xFFF97316) : Colors.grey.shade200,
                          width: 2,
                        ),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            service['icon'],
                            color: isSelected ? const Color(0xFFF97316) : Colors.grey,
                            size: 32,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            service['label'],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: isSelected ? const Color(0xFFF97316) : Colors.grey.shade700,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),

            const SizedBox(height: 24),
            
            // 2. Dates & Time
            const Text(
              'Dates & Time',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            GestureDetector(
              onTap: () async {
                final result = await showDateRangePicker(
                  context: context,
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 90)),
                  builder: (context, child) {
                    return Theme(
                      data: Theme.of(context).copyWith(
                        colorScheme: const ColorScheme.light(
                          primary: Color(0xFFF97316),
                        ),
                      ),
                      child: child!,
                    );
                  },
                );
                
                if (result != null) {
                  setState(() {
                    _selectedDateRange = result;
                  });
                }
              },
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_today, color: Color(0xFFF97316)),
                    const SizedBox(width: 12),
                    Text(
                      _selectedDateRange == null
                          ? 'Select Check-in - Check-out'
                          : '${_selectedDateRange!.start.toString().split(' ')[0]}  -  ${_selectedDateRange!.end.toString().split(' ')[0]}',
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              ),
            ),
            
            // Times
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildTimePicker(
                    context,
                    'Start Time',
                    _startTime,
                    (time) => setState(() => _startTime = time),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildTimePicker(
                    context,
                    'End Time',
                    _endTime,
                    (time) => setState(() => _endTime = time),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: 24),

            // 3. Pets Selection
            const Text(
              'Pets',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildCounter('Dogs', _dogCount, (val) => setState(() => _dogCount = val)),
                  Container(width: 1, height: 40, color: Colors.grey.shade200),
                  _buildCounter('Cats', _catCount, (val) => setState(() => _catCount = val)),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // 4. Message
            const Text(
              'Message',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _messageController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Share details about your pet and any special requests...',
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade200),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFF97316)),
                ),
              ),
            ),

            const SizedBox(height: 32),
            
            const Divider(),
            
            const SizedBox(height: 16),
            
            // Price Calculation
            if (_selectedDateRange != null) ...[
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '\$$priceInt x $totalNights nights',
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 16),
                  ),
                  Text(
                    '\$$basePrice',
                    style: TextStyle(color: Colors.grey.shade700, fontSize: 16),
                  ),
                ],
              ),
              if (totalPets > 1) ...[
                 const SizedBox(height: 8),
                 Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Additional Pets',
                      style: TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                    Text(
                      '(x$petMultiplier)',
                      style: const TextStyle(color: Colors.grey, fontSize: 16),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Service Fee',
                    style: TextStyle(color: Colors.grey, fontSize: 16),
                  ),
                  const Text(
                    '\$5',
                    style: TextStyle(color: Colors.grey, fontSize: 16),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text(
                    'Total',
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    '\$${totalPrice + 5}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFF97316),
                    ),
                  ),
                ],
              ),
            ],
            
            const SizedBox(height: 40),
            
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: (_selectedDateRange == null || _isLoading || _availableServices.isEmpty) ? null : _submitBooking,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF97316),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30),
                  ),
                  disabledBackgroundColor: Colors.grey.shade300,
                ),
                child: _isLoading 
                  ? const SizedBox(
                      width: 24, 
                      height: 24, 
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)
                    )
                  : Text(
                      widget.booking != null ? 'Update Booking' : 'Confirm Booking',
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _isLoading = false;

  Future<void> _submitBooking() async {
    setState(() => _isLoading = true);
    
    // Calculate days
    final days = _selectedDateRange!.end.difference(_selectedDateRange!.start).inDays + 1;
    
    final bookingData = {
      'sitterId': widget.sitter['id'],
      'serviceType': _selectedService,
      'startDate': _selectedDateRange!.start.toIso8601String(),
      'endDate': _selectedDateRange!.end.toIso8601String(),
      'petIds': [], // Sending empty list as we don't have pet selection yet
      'message': _messageController.text,
      'totalPrice': _calculateTotalPrice(),
    };

    final apiService = Provider.of<ApiService>(context, listen: false);
    final result = await apiService.createBooking(bookingData);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (result['success']) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Booking Request Sent Successfully! 🐾'),
          backgroundColor: Colors.green,
        ),
      );
      context.go('/bookings'); // Go to bookings tab to see the new pending booking
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Booking failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }


  double _calculateTotalPrice() {
    final services = widget.sitter['services'] as Map<String, dynamic>? ?? {};
    
    final currentServiceObj = _allServices.firstWhere(
      (s) => s['id'] == _selectedService, 
      orElse: () => _allServices.first
    );
    final backendServiceKey = currentServiceObj['backendKey'];

    final serviceData = services[backendServiceKey] as Map<String, dynamic>?;
    final priceInt = (serviceData?['rate'] as num?)?.toInt() ?? 30;
    
    // Calculate nights
    int totalNights = 0;
    if (_selectedDateRange != null) {
      totalNights = _selectedDateRange!.duration.inDays;
      if (totalNights == 0) totalNights = 1; 
    }
    
    // Calculate total params
    final totalPets = _dogCount + _catCount;
    final petMultiplier = totalPets > 1 ? 1 + (totalPets - 1) * 0.5 : 1;
    final basePrice = totalNights * priceInt;
    final totalPrice = (basePrice * petMultiplier).round();
    
    // Add service fee
    return (totalPrice + 5).toDouble();
  }

  Widget _buildTimePicker(
      BuildContext context, String label, TimeOfDay time, Function(TimeOfDay) onChanged) {
    return GestureDetector(
      onTap: () async {
        final newTime = await showTimePicker(context: context, initialTime: time);
        if (newTime != null) onChanged(newTime);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: Colors.grey.shade300),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: TextStyle(fontSize: 12, color: Colors.grey.shade500)),
            const SizedBox(height: 4),
            Text(
              time.format(context),
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCounter(String label, int value, Function(int) onChanged) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        Row(
          children: [
            _buildIconButton(Icons.remove, () {
              if (value > 0) onChanged(value - 1);
            }),
            SizedBox(
              width: 40, 
              child: Center(
                child: Text('$value', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold))
              ),
            ),
            _buildIconButton(Icons.add, () => onChanged(value + 1)),
          ],
        ),
      ],
    );
  }

  Widget _buildIconButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.grey.shade100,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 20, color: const Color(0xFFF97316)),
      ),
    );
  }
}
