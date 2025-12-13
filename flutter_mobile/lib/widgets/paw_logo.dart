import 'package:flutter/material.dart';

class PawLogo extends StatelessWidget {
  final double size;
  
  const PawLogo({super.key, this.size = 80});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size * 1.4,
      height: size,
      child: Stack(
        children: [
          // Orange paw print (left)
          Positioned(
            left: 0,
            top: 0,
            child: _PawPrint(
              color: const Color(0xFFF97316), // Orange
              size: size,
              hasOutline: true,
            ),
          ),
          // Blue paw print (right, slightly offset)
          Positioned(
            left: size * 0.5,
            top: size * 0.1,
            child: _PawPrint(
              color: const Color(0xFF3B82F6), // Blue
              size: size,
              hasOutline: false,
            ),
          ),
        ],
      ),
    );
  }
}

class _PawPrint extends StatelessWidget {
  final Color color;
  final double size;
  final bool hasOutline;

  const _PawPrint({
    required this.color,
    required this.size,
    this.hasOutline = false,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: PawPrintPainter(
        color: color,
        hasOutline: hasOutline,
      ),
    );
  }
}

class PawPrintPainter extends CustomPainter {
  final Color color;
  final bool hasOutline;

  PawPrintPainter({
    required this.color,
    this.hasOutline = false,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = color;

    final outlinePaint = Paint()
      ..style = PaintingStyle.stroke
      ..color = Colors.white
      ..strokeWidth = 2;

    final centerX = size.width / 2;
    final centerY = size.height / 2;

    // Main pad (bottom, larger)
    final mainPadRadius = size.width * 0.25;
    final mainPadCenter = Offset(centerX, centerY + size.height * 0.15);
    
    if (hasOutline) {
      canvas.drawCircle(mainPadCenter, mainPadRadius + 1, outlinePaint);
    }
    canvas.drawCircle(mainPadCenter, mainPadRadius, paint);

    // Top three pads (smaller, in an arc)
    final topPadRadius = size.width * 0.12;
    final topPadY = centerY - size.height * 0.2;
    
    // Left pad
    final leftPad = Offset(centerX - size.width * 0.2, topPadY);
    if (hasOutline) {
      canvas.drawCircle(leftPad, topPadRadius + 1, outlinePaint);
    }
    canvas.drawCircle(leftPad, topPadRadius, paint);

    // Center pad
    final centerPad = Offset(centerX, topPadY - size.height * 0.1);
    if (hasOutline) {
      canvas.drawCircle(centerPad, topPadRadius + 1, outlinePaint);
    }
    canvas.drawCircle(centerPad, topPadRadius, paint);

    // Right pad
    final rightPad = Offset(centerX + size.width * 0.2, topPadY);
    if (hasOutline) {
      canvas.drawCircle(rightPad, topPadRadius + 1, outlinePaint);
    }
    canvas.drawCircle(rightPad, topPadRadius, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

