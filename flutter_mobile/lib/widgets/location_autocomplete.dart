import 'dart:async';
import 'package:flutter/material.dart';
import '../services/location_service.dart';

class LocationAutocomplete extends StatefulWidget {
  final TextEditingController controller;
  final Function(LocationSuggestion)? onLocationSelected;
  final String? hintText;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixTap;

  const LocationAutocomplete({
    super.key,
    required this.controller,
    this.onLocationSelected,
    this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixTap,
  });

  @override
  State<LocationAutocomplete> createState() => _LocationAutocompleteState();
}

class _LocationAutocompleteState extends State<LocationAutocomplete> {
  List<LocationSuggestion> _suggestions = [];
  bool _isLoading = false;
  Timer? _debounceTimer;
  final LayerLink _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    widget.controller.addListener(_onTextChanged);
    _focusNode.addListener(_onFocusChanged);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    widget.controller.removeListener(_onTextChanged);
    _focusNode.removeListener(_onFocusChanged);
    _focusNode.dispose();
    _removeOverlay();
    super.dispose();
  }

  void _onTextChanged() {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _searchLocations(widget.controller.text);
    });
  }

  void _onFocusChanged() {
    if (_focusNode.hasFocus && widget.controller.text.isNotEmpty) {
      _searchLocations(widget.controller.text);
    } else if (!_focusNode.hasFocus) {
      _removeOverlay();
    }
  }

  Future<void> _searchLocations(String query) async {
    if (query.trim().isEmpty || query.length < 2) {
      setState(() {
        _suggestions = [];
        _isLoading = false;
      });
      _removeOverlay();
      return;
    }

    setState(() {
      _isLoading = true;
    });

    final suggestions = await LocationService.searchLocations(query);

    if (mounted) {
      setState(() {
        _suggestions = suggestions;
        _isLoading = false;
      });

      if (_suggestions.isNotEmpty && _focusNode.hasFocus) {
        _showOverlay();
      } else {
        _removeOverlay();
      }
    }
  }

  void _showOverlay() {
    _removeOverlay();

    _overlayEntry = _createOverlayEntry();
    Overlay.of(context).insert(_overlayEntry!);
  }

  void _removeOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  OverlayEntry _createOverlayEntry() {
    RenderBox renderBox = context.findRenderObject() as RenderBox;
    var size = renderBox.size;

    return OverlayEntry(
      builder: (context) => Positioned(
        width: size.width,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: Offset(0.0, size.height + 5.0),
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(12),
            color: Colors.white,
            child: Container(
              constraints: const BoxConstraints(maxHeight: 250),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: _isLoading
                  ? const Padding(
                      padding: EdgeInsets.all(16.0),
                      child: Center(
                        child: CircularProgressIndicator(
                          color: Color(0xFFF97316),
                        ),
                      ),
                    )
                  : _suggestions.isEmpty
                      ? Padding(
                          padding: const EdgeInsets.all(16.0),
                          child: Text(
                            'No locations found',
                            style: TextStyle(
                              color: Colors.grey.shade600,
                              fontSize: 14,
                            ),
                          ),
                        )
                      : ListView.separated(
                          shrinkWrap: true,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: _suggestions.length,
                          separatorBuilder: (context, index) => Divider(
                            height: 1,
                            color: Colors.grey.shade200,
                          ),
                          itemBuilder: (context, index) {
                            final suggestion = _suggestions[index];
                            return ListTile(
                              leading: const Icon(
                                Icons.location_on,
                                color: Color(0xFFF97316),
                                size: 24,
                              ),
                              title: Text(
                                suggestion.shortDisplay,
                                style: const TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.w600,
                                  color: Colors.black87,
                                ),
                              ),
                              subtitle: Text(
                                suggestion.fullAddress,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey.shade600,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              dense: true,
                              onTap: () {
                                widget.controller.text = suggestion.shortDisplay;
                                widget.onLocationSelected?.call(suggestion);
                                _focusNode.unfocus();
                                _removeOverlay();
                              },
                            );
                          },
                        ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: TextField(
        controller: widget.controller,
        focusNode: _focusNode,
        decoration: InputDecoration(
          hintText: widget.hintText ?? 'Try "New York, NY"...',
          hintStyle: TextStyle(color: Colors.grey.shade400),
          prefixIcon: widget.prefixIcon != null
              ? Icon(
                  widget.prefixIcon,
                  color: const Color(0xFFF97316),
                )
              : const Icon(
                  Icons.location_on_outlined,
                  color: Color(0xFFF97316),
                ),
          suffixIcon: widget.suffixIcon != null
              ? IconButton(
                  icon: Icon(
                    widget.suffixIcon,
                    color: const Color(0xFFF97316),
                    size: 20,
                  ),
                  onPressed: widget.onSuffixTap,
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: BorderSide(color: Colors.grey.shade300),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30),
            borderSide: const BorderSide(
              color: Color(0xFFF97316),
              width: 2,
            ),
          ),
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 20,
            vertical: 16,
          ),
        ),
      ),
    );
  }
}

