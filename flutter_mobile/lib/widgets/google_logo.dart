import 'package:flutter/material.dart';

class GoogleLogo extends StatelessWidget {
  final double size;
  
  const GoogleLogo({super.key, this.size = 20});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(2),
      ),
      child: CustomPaint(
        painter: GoogleLogoPainter(),
      ),
    );
  }
}

class GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    
    // Google 'G' logo simplified representation
    // Blue part
    paint.color = const Color(0xFF4285F4);
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.3, 0, size.width * 0.7, size.height),
      paint,
    );
    
    // Red part
    paint.color = const Color(0xFFEA4335);
    canvas.drawRect(
      Rect.fromLTWH(0, size.height * 0.3, size.width * 0.4, size.height * 0.4),
      paint,
    );
    
    // Yellow part
    paint.color = const Color(0xFFFBBC05);
    canvas.drawRect(
      Rect.fromLTWH(0, size.height * 0.6, size.width * 0.4, size.height * 0.4),
      paint,
    );
    
    // Green part
    paint.color = const Color(0xFF34A853);
    canvas.drawRect(
      Rect.fromLTWH(size.width * 0.3, size.height * 0.6, size.width * 0.4, size.height * 0.4),
      paint,
    );
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

