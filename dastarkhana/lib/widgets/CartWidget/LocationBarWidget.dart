import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../../utils/colors.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class LocationBarWidget extends StatefulWidget {
  const LocationBarWidget({Key? key}) : super(key: key);

  @override
  _LocationBarWidgetState createState() => _LocationBarWidgetState();
}

class _LocationBarWidgetState extends State<LocationBarWidget> {
  String userLocation = '';
  String userAddress = 'Мекенжай анықталуда...';
  bool isFetchingAddress = false;

  @override
  void initState() {
    super.initState();
    getCurrentLocationApp();
  }

  Future<void> getCurrentLocationApp() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return;
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        print("Мекенжайға рұқсат берілмеді.");
        return;
      }
    }

    if (permission == LocationPermission.deniedForever) {
      print("Мекенжайға рұқсат біржола берілмеді.");
      return;
    }

    // Get the current location
    Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high);
    setState(() {
      userLocation = "${position.latitude}, ${position.longitude}";
    });
    print("Қазіргі мекенжай: $userLocation");

    // Fetch the address after getting the coordinates
    await getAddressFromCoordinates(userLocation);
  }

  Future<void> getAddressFromCoordinates(String coordinates) async {
    setState(() {
      isFetchingAddress = true;
    });

    final latLng = coordinates.split(',');
    if (latLng.length != 2) {
      setState(() {
        userAddress = 'Мекенжай форматы дұрыс емес';
        isFetchingAddress = false;
      });
      return;
    }

    final lat = latLng[0].trim();
    final lng = latLng[1].trim();

    final url = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng&zoom=18&addressdetails=1');

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String address = data['display_name'] ?? 'Unknown location';

        // Simplify address (until second level)
        int commaCount = 0;
        int index = 0;
        for (int i = 0; i < address.length; i++) {
          if (address[i] == ',') {
            commaCount++;
          }
          if (commaCount == 2) {
            index = i;
            break;
          }
        }
        if (commaCount >= 2) {
          address = address.substring(0, index);
        }

        setState(() {
          userAddress = address;
        });
      } else {
        setState(() {
          userAddress = 'Мекенжай табылмады';
        });
      }
    } catch (error) {
      print("Геокодтау кезінде қате пайда болды:: $error");
      setState(() {
        userAddress = 'Мекенжай қолжетімсіз';
      });
    } finally {
      setState(() {
        isFetchingAddress = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Container(
            padding: EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: successColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.location_on,
              color: successColor,
              size: 24,
            ),
          ),
          SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Жеткізу мекенжайы",
                  style: TextStyle(
                    fontSize: 14,
                    fontFamily: "SF-Pro-Text-Medium",
                    color: Colors.grey[600],
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  isFetchingAddress
                      ? 'Мекенжай анықталуда...'
                      : userAddress,
                  style: TextStyle(
                    fontSize: 16,
                    fontFamily: "SF-Pro-Text-Bold",
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          Icon(Icons.chevron_right, color: Colors.grey[600]),
        ],
      ),
    );
  }
}
