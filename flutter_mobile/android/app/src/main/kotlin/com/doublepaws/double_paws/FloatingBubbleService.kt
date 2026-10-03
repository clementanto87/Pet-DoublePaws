package com.doublepaws.double_paws

import android.app.Service
import android.content.Intent
import android.graphics.*
import android.os.Build
import android.os.IBinder
import android.view.*
import android.view.animation.OvershootInterpolator
import android.widget.FrameLayout
import kotlin.math.abs
import kotlin.math.hypot

class FloatingBubbleService : Service() {

    private var windowManager: WindowManager? = null
    private var bubbleView: View? = null
    private var params: WindowManager.LayoutParams? = null

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var moved = false

    companion object {
        var onTapCallback: (() -> Unit)? = null
        var instance: FloatingBubbleService? = null
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        instance = this
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val size = (56 * resources.displayMetrics.density).toInt()

        bubbleView = BubbleDrawView(this, size).apply {
            layoutParams = FrameLayout.LayoutParams(size, size)
        }

        val overlayType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        else
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE

        params = WindowManager.LayoutParams(
            size, size,
            overlayType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.START
            x = resources.displayMetrics.widthPixels - size - (16 * resources.displayMetrics.density).toInt()
            y = (resources.displayMetrics.heightPixels * 0.3).toInt()
        }

        bubbleView!!.setOnTouchListener(BubbleTouchListener())
        windowManager?.addView(bubbleView, params)

        startIdleAnimation()
    }

    override fun onDestroy() {
        instance = null
        bubbleView?.let { windowManager?.removeView(it) }
        super.onDestroy()
    }

    fun removeBubble() {
        stopSelf()
    }

    private fun startIdleAnimation() {
        bubbleView?.let { v ->
            val breathe = android.animation.ObjectAnimator.ofFloat(v, "scaleX", 1f, 1.08f, 1f)
            breathe.duration = 2400
            breathe.repeatCount = android.animation.ValueAnimator.INFINITE
            breathe.interpolator = android.view.animation.AccelerateDecelerateInterpolator()

            val breatheY = android.animation.ObjectAnimator.ofFloat(v, "scaleY", 1f, 1.08f, 1f)
            breatheY.duration = 2400
            breatheY.repeatCount = android.animation.ValueAnimator.INFINITE
            breatheY.interpolator = android.view.animation.AccelerateDecelerateInterpolator()

            val set = android.animation.AnimatorSet()
            set.playTogether(breathe, breatheY)
            set.start()
        }
    }

    private inner class BubbleTouchListener : View.OnTouchListener {
        override fun onTouch(v: View, event: MotionEvent): Boolean {
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params!!.x
                    initialY = params!!.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    moved = false
                    v.scaleX = 0.9f
                    v.scaleY = 0.9f
                    return true
                }
                MotionEvent.ACTION_MOVE -> {
                    val dx = event.rawX - initialTouchX
                    val dy = event.rawY - initialTouchY
                    if (hypot(dx, dy) > 10) moved = true
                    params!!.x = initialX + dx.toInt()
                    params!!.y = initialY + dy.toInt()
                    windowManager?.updateViewLayout(bubbleView, params)
                    return true
                }
                MotionEvent.ACTION_UP -> {
                    v.animate().scaleX(1f).scaleY(1f).setDuration(200)
                        .setInterpolator(OvershootInterpolator()).start()

                    if (!moved) {
                        v.animate().scaleX(1.2f).scaleY(1.2f).setDuration(100).withEndAction {
                            v.animate().scaleX(1f).scaleY(1f).setDuration(150)
                                .setInterpolator(OvershootInterpolator()).start()
                        }.start()
                        onTapCallback?.invoke()
                    } else {
                        snapToEdge()
                    }
                    return true
                }
            }
            return false
        }
    }

    private fun snapToEdge() {
        val screenWidth = resources.displayMetrics.widthPixels
        val targetX = if (params!!.x + (bubbleView?.width ?: 0) / 2 < screenWidth / 2) {
            (8 * resources.displayMetrics.density).toInt()
        } else {
            screenWidth - (bubbleView?.width ?: 0) - (8 * resources.displayMetrics.density).toInt()
        }

        val animator = android.animation.ValueAnimator.ofInt(params!!.x, targetX)
        animator.duration = 250
        animator.interpolator = OvershootInterpolator(1.2f)
        animator.addUpdateListener { anim ->
            params!!.x = anim.animatedValue as Int
            try { windowManager?.updateViewLayout(bubbleView, params) } catch (_: Exception) {}
        }
        animator.start()
    }
}

class BubbleDrawView(context: android.content.Context, private val size: Int) : View(context) {

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        shader = LinearGradient(
            0f, 0f, size.toFloat(), size.toFloat(),
            intArrayOf(0xFF7C5CFC.toInt(), 0xFFB06CFF.toInt(), 0xFFFF6BC6.toInt()),
            null, Shader.TileMode.CLAMP
        )
    }
    private val eyePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = Color.WHITE }
    private val pupilPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { color = 0xFF2D1B69.toInt() }
    private val mouthPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.WHITE; style = Paint.Style.STROKE; strokeWidth = size * 0.035f; strokeCap = Paint.Cap.ROUND
    }
    private val shimmerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = 0x30FFFFFF; style = Paint.Style.FILL
    }

    private val shadowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        setShadowLayer(size * 0.15f, 0f, size * 0.06f, 0x40000000)
    }

    override fun onDraw(canvas: Canvas) {
        val cx = size / 2f
        val cy = size / 2f
        val r = size * 0.44f

        setLayerType(LAYER_TYPE_SOFTWARE, shadowPaint)
        canvas.drawCircle(cx, cy, r, shadowPaint)
        canvas.drawCircle(cx, cy, r, bgPaint)

        // eyes
        val eyeY = cy - r * 0.1f
        val eyeSpacing = r * 0.35f
        val eyeR = r * 0.13f
        canvas.drawCircle(cx - eyeSpacing, eyeY, eyeR, eyePaint)
        canvas.drawCircle(cx + eyeSpacing, eyeY, eyeR, eyePaint)

        // pupils
        val pupilR = eyeR * 0.55f
        canvas.drawCircle(cx - eyeSpacing + pupilR * 0.2f, eyeY + pupilR * 0.1f, pupilR, pupilPaint)
        canvas.drawCircle(cx + eyeSpacing + pupilR * 0.2f, eyeY + pupilR * 0.1f, pupilR, pupilPaint)

        // smile
        val smileRect = RectF(cx - r * 0.28f, cy + r * 0.05f, cx + r * 0.28f, cy + r * 0.4f)
        canvas.drawArc(smileRect, 10f, 160f, false, mouthPaint)

        // shimmer highlight
        canvas.drawCircle(cx - r * 0.25f, cy - r * 0.3f, r * 0.15f, shimmerPaint)
    }
}
