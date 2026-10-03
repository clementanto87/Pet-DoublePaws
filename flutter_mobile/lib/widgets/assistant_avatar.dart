import 'package:flutter/material.dart';
import 'dart:math' as math;

class AssistantAvatar extends StatelessWidget {
  final double size;
  const AssistantAvatar({super.key, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(size, size),
      painter: _AvatarPainter(),
    );
  }
}

class AnimatedAssistantAvatar extends StatefulWidget {
  final double size;
  final bool listening;
  const AnimatedAssistantAvatar({super.key, this.size = 80, this.listening = false});

  @override
  State<AnimatedAssistantAvatar> createState() => _AnimatedAssistantAvatarState();
}

class _AnimatedAssistantAvatarState extends State<AnimatedAssistantAvatar> with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 2400))..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (_, __) {
        final breathe = 1.0 + math.sin(_ctrl.value * 2 * math.pi) * 0.04;
        final bob = math.sin(_ctrl.value * 2 * math.pi) * 2.0;
        return Transform.translate(
          offset: Offset(0, bob),
          child: Transform.scale(
            scale: breathe,
            child: Container(
              width: widget.size,
              height: widget.size,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF7C5CFC).withOpacity(widget.listening ? 0.5 : 0.25),
                    blurRadius: widget.listening ? 24 : 12,
                    spreadRadius: widget.listening ? 4 : 0,
                  ),
                ],
              ),
              child: CustomPaint(
                size: Size(widget.size, widget.size),
                painter: _AvatarPainter(mouthOpen: widget.listening),
              ),
            ),
          ),
        );
      },
    );
  }
}

class _AvatarPainter extends CustomPainter {
  final bool mouthOpen;
  _AvatarPainter({this.mouthOpen = false});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;
    final r = size.width * 0.44;

    // shadow
    canvas.drawCircle(Offset(cx, cy + r * 0.08), r, Paint()
      ..color = const Color(0x40000000)
      ..maskFilter = MaskFilter.blur(BlurStyle.normal, r * 0.2));

    // gradient body
    final bgPaint = Paint()
      ..shader = LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: const [Color(0xFF7C5CFC), Color(0xFFB06CFF), Color(0xFFFF6BC6)],
      ).createShader(Rect.fromCircle(center: Offset(cx, cy), radius: r));
    canvas.drawCircle(Offset(cx, cy), r, bgPaint);

    // eyes
    final eyeY = cy - r * 0.1;
    final eyeSpacing = r * 0.35;
    final eyeR = r * 0.14;
    final eyePaint = Paint()..color = Colors.white;
    canvas.drawCircle(Offset(cx - eyeSpacing, eyeY), eyeR, eyePaint);
    canvas.drawCircle(Offset(cx + eyeSpacing, eyeY), eyeR, eyePaint);

    // pupils
    final pupilR = eyeR * 0.55;
    final pupilPaint = Paint()..color = const Color(0xFF2D1B69);
    canvas.drawCircle(Offset(cx - eyeSpacing + pupilR * 0.15, eyeY + pupilR * 0.1), pupilR, pupilPaint);
    canvas.drawCircle(Offset(cx + eyeSpacing + pupilR * 0.15, eyeY + pupilR * 0.1), pupilR, pupilPaint);

    // mouth
    if (mouthOpen) {
      canvas.drawOval(
        Rect.fromCenter(center: Offset(cx, cy + r * 0.28), width: r * 0.38, height: r * 0.28),
        Paint()..color = const Color(0xFF2D1B69),
      );
    } else {
      final mouthPath = Path()
        ..addArc(
          Rect.fromCenter(center: Offset(cx, cy + r * 0.2), width: r * 0.5, height: r * 0.32),
          0.17, math.pi - 0.34,
        );
      canvas.drawPath(mouthPath, Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = r * 0.06
        ..strokeCap = StrokeCap.round);
    }

    // shimmer
    canvas.drawCircle(
      Offset(cx - r * 0.28, cy - r * 0.32),
      r * 0.12,
      Paint()..color = const Color(0x30FFFFFF),
    );
  }

  @override
  bool shouldRepaint(covariant _AvatarPainter old) => old.mouthOpen != mouthOpen;
}
