import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SitterResultCard extends StatelessWidget {
  final Map<String, dynamic> sitter;

  const SitterResultCard({super.key, required this.sitter});

  @override
  Widget build(BuildContext context) {
    // Extract data with safe defaults
    // Extract data with safe defaults for Backend Structure
    final user = sitter['user'] ?? {};
    final firstName = user['firstName'] ?? 'Sitter';
    final lastName = user['lastName'] ?? '';
    
    // Calculate Rating
    final reviews = sitter['reviews'] as List?;
    String rating = 'New';
    String reviewsCount = '0';
    if (reviews != null && reviews.isNotEmpty) {
      final double avg = reviews.fold<double>(0, (sum, r) => sum + (r['rating'] as num).toDouble()) / reviews.length;
      rating = avg.toStringAsFixed(1);
      reviewsCount = reviews.length.toString();
    } else {
      // Fallback if 'rating' was passed directly (mock compatibility/edge case)
      if (sitter['rating'] != null) rating = sitter['rating'].toString();
      if (sitter['reviewsCount'] != null) reviewsCount = sitter['reviewsCount'].toString();
    }

    // Calculate Price (lowest active service)
    String price = '0';
    final services = sitter['services'] as Map<String, dynamic>?;
    if (services != null) {
      double? minPrice;
      services.forEach((key, value) {
        if (value is Map && value['active'] == true) {
          final rate = (value['rate'] as num?)?.toDouble();
          if (rate != null) {
            if (minPrice == null || rate < minPrice!) {
              minPrice = rate;
            }
          }
        }
      });
      if (minPrice != null) {
        price = minPrice!.toStringAsFixed(0);
      }
    } else {
        // Fallback for mock data compatibility
        price = sitter['price']?.toString() ?? '0';
    }

    final title = sitter['headline'] ?? 'Loving Pet Sitter';
    // Use a placeholder if location is missing, or extract from user address if available
    final location = sitter['address'] ?? user['address'] ?? 'Nearby'; 

    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // 1. Header Section (Profile, Info, Price)
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Avatar
                CircleAvatar(
                  radius: 32,
                  backgroundColor: const Color(0xFFF97316).withOpacity(0.1),
                  child: Text(
                    firstName.isNotEmpty ? firstName[0].toUpperCase() : 'S',
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFF97316),
                    ),
                  ),
                  // foregroundImage: NetworkImage(imageUrl), // Uncomment if image URL exists
                ),
                const SizedBox(width: 16),
                
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Flexible(
                            child: Text(
                              '$firstName $lastName',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFFF97316),
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const SizedBox(width: 8),
                          const Icon(Icons.favorite_border, color: Colors.grey),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        title,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Icon(Icons.location_on, size: 14, color: Colors.grey.shade400),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              location,
                              style: TextStyle(fontSize: 12, color: Colors.grey.shade500),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      // Rating and Price Row
                      Row(
                        children: [
                          const Icon(Icons.star_rounded, size: 20, color: Color(0xFFEAB308)), // Amber
                          const SizedBox(width: 4),
                          Text(
                            rating,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          Text(
                            ' ($reviewsCount)',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                          ),
                          const Spacer(),
                          Text(
                            '\$$price',
                            style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFFF97316),
                            ),
                          ),
                          Text(
                            '/night',
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 2. Action Buttons
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      context.push('/book-sitter', extra: sitter);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF0EA5E9), // Sky Blue
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('Book', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () {
                      context.push('/sitter-profile', extra: sitter);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF97316), // Orange
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                    child: const Text('View Profile', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          const Divider(height: 1),
          const SizedBox(height: 16),

          // 3. Calendar Preview
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                // Calendar Header
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'December 2025',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Row(
                      children: [
                        Icon(Icons.chevron_left, color: Colors.grey.shade400),
                        const SizedBox(width: 16),
                        const Icon(Icons.chevron_right),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                // Legend
                Row(
                  children: [
                    _buildLegendItem(const Color(0xFF22C55E), 'Available'),
                    const SizedBox(width: 12),
                    _buildLegendItem(const Color(0xFFEAB308), 'Booked'),
                    const SizedBox(width: 12),
                    _buildLegendItem(Colors.grey.shade300, 'Not available'),
                  ],
                ),
                const SizedBox(height: 16),
                // Days Grid
                _buildCalendarGrid(),
              ],
            ),
          ),

          const SizedBox(height: 16),
          const Divider(height: 1),
          
          // 4. Footer
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Icon(Icons.check_circle_outline, size: 16, color: Colors.green.shade600),
                const SizedBox(width: 8),
                Text(
                  'Updated 3 days ago',
                  style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                ),
                const Spacer(),
                RichText(
                  text: TextSpan(
                    style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    children: const [
                       TextSpan(text: 'Cancellation: '),
                       TextSpan(
                        text: 'flexible',
                        style: TextStyle(
                          color: Color(0xFFF97316),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(
          width: 8,
          height: 8,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 11,
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildCalendarGrid() {
    // Mock days: S M T W T F S header
    final weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return Column(
      children: [
        // Week Header
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: weekDays.map((d) => SizedBox(
            width: 30,
            child: Center(
              child: Text(
                d,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade400,
                ),
              ),
            ),
          )).toList(),
        ),
        const SizedBox(height: 8),
        // Days Row 1 (Mock data visual)
        _buildCalendarRow(1),
        // Days Row 2
        _buildCalendarRow(8),
        // Days Row 3
        _buildCalendarRow(15),
         // Days Row 4
        _buildCalendarRow(22),
      ],
    );
  }

  Widget _buildCalendarRow(int startDay) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: List.generate(7, (index) {
          final dayNum = startDay + index;
          if (dayNum > 31) return const SizedBox(width: 30);
          
          // Pattern logic for demo color
          Color bgColor = Colors.transparent;
          Color textColor = Colors.black87;
          BoxBorder? border;

          if (dayNum == 11) { // Selected/Specific
            border = Border.all(color: const Color(0xFFF97316), width: 1.5);
            bgColor = Colors.white;
          } else if ([14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28, 29, 30, 31].contains(dayNum)) {
             bgColor = const Color(0xFFDCFCE7); // Light Green
             textColor = const Color(0xFF166534);
          } else if ([25].contains(dayNum)) {
             bgColor = Colors.grey.shade100; // Not available
             textColor = Colors.grey.shade300;
          } else {
             // Default/Booked style for others or just plain
             bgColor = Colors.grey.shade50;
             textColor = Colors.grey.shade300;
          }

          return Container(
            width: 30,
            height: 30,
            decoration: BoxDecoration(
              color: bgColor,
              shape: BoxShape.circle,
              border: border,
            ),
            child: Center(
              child: Text(
                '$dayNum',
                style: TextStyle(
                  fontSize: 12,
                  color: textColor,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
