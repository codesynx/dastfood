import 'package:Dastarkhana/widgets/CartWidget/EmptyCart.dart';
import 'package:flutter/material.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:geolocator/geolocator.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:Dastarkhana/utils/api_constants.dart';
import 'package:Dastarkhana/utils/colors.dart';
import 'package:flutter/services.dart';
// Import du fichier contenant le widget EmptyCart

class DeliverymanOrders extends StatefulWidget {
  final int id;
  const DeliverymanOrders({Key? key, required this.id}) : super(key: key);

  @override
  State<DeliverymanOrders> createState() => _DeliverymanOrdersState();
}

class _DeliverymanOrdersState extends State<DeliverymanOrders> {
  List<dynamic> _orders = [];
  Map<int, bool> _expandedItems = {};
  Map<String, String> _addressCache = {};
  bool isLoading = true;
  double myLatitude = 0.0;
  double myLongitude = 0.0;

  @override
  void initState() {
    super.initState();
    getCurrentLocation();
    getOrdersData();
  }

  Future<void> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;

    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw 'Орналасу қызметтері сөндірілген';
    }

    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw 'Орналасуға рұқсат берілмеген.';
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw 'Орналасуға рұқсат мәңгілікке берілмеген.';
    }

    final position = await Geolocator.getCurrentPosition();
    setState(() {
      myLatitude = position.latitude;
      myLongitude = position.longitude;
    });
  }

  Future<void> getOrdersData() async {
    try {
      final response = await http.get(Uri.parse(ApiConstants.getOrderByDeliveryManId + '${widget.id}'));
      if (response.statusCode == 200) {
        List<dynamic> orders = jsonDecode(response.body);

        // Récupérer les adresses
        for (var order in orders) {
          String location = order['location'] ?? '';
          if (location.isNotEmpty) {
            order['locationName'] = await getAddressFromCoordinates(location);
          } else {
            order['locationName'] = 'Орналасу белгісіз';
          }
        }

        setState(() {
          _orders = orders;
          isLoading = false;
        });
      } else {
        throw Exception('Тапсырыстарды жүктеу мүмкін болмады: ${response.reasonPhrase}');
      }
    } catch (error) {
      print("Тапсырыстарды алу кезінде қате шықты: $error");
    }
  }

  Future<String> getAddressFromCoordinates(String coordinates) async {
    if (_addressCache.containsKey(coordinates)) {
      return _addressCache[coordinates]!;
    }

    final latLng = coordinates.split(',');
    if (latLng.length != 2) return 'Орналасу дұрыс емес';

    final lat = latLng[0].trim();
    final lng = latLng[1].trim();

    final url = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng&zoom=18&addressdetails=1');

    try {
      final response = await http.get(url);
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String address = data['display_name'] ?? 'Орналасу белгісіз';

        // Simplifier l'adresse (jusqu'au deuxième niveau)
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

        _addressCache[coordinates] = address;
        return address;
      } else {
        return 'Орналасу табылмады';
      }
    } catch (error) {
      print("Геокодтау кезінде қате шықты : $error");
      return 'Орналасу қолжетімсіз';
    }
  }

  void openGoogleMaps(String coordinates) async {
    final Uri googleMapsUri = Uri.parse(
        'https://www.google.com/maps/dir/?api=1&origin=$myLatitude,$myLongitude&destination=$coordinates&travelmode=driving');

    if (!await launchUrl(googleMapsUri, mode: LaunchMode.externalApplication)) {
      throw 'Google Maps ашу мүмкін болмады.';
    }
  }

  Future<void> updateOrderStatus(int id, String status) async {
    try {
      final response = await http.patch(
        Uri.parse('${ApiConstants.UpdateOrderStatusById}$id'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'status': status}),
      );

      if (response.statusCode == 200) {
        print("Тапсырыстың күйі $status болып жаңартылды");

        // Mettre à jour l'état local de la commande
        setState(() {
          final orderIndex = _orders.indexWhere((order) => order['id'] == id);
          if (orderIndex != -1) {
            _orders[orderIndex]['status'] = status;
          }
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Тапсырыс күйі сәтті жаңартылды'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        print("Тапсырыс күйін жаңарту мүмкін болмады: ${response.statusCode}");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Тапсырыстың күйін жаңарту сәтсіз аяқталды.'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (error) {
      print("Тапсырыс күйін жаңарту кезінде қате пайда болды: $error");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Күйін жаңарту кезінде қате орын алды.'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void CallCustemer(String phone) async {
    if (phone.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Телефон нөмірі дұрыс емес.'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    final Uri telUri = Uri(scheme: 'tel', path: phone.trim());

    try {
      if (await canLaunchUrl(telUri)) {
        await launchUrl(telUri, mode: LaunchMode.externalApplication);
      } else {
        throw 'Қоңырау шалу үшін қолжетімді қолданба табылмады.';
      }
    } catch (error) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('Қате'),
            content: Text(
                "Қоңырау шалатын қолданбаны ашу мүмкін болмады. Нөмірді көшіріп, қолмен енгізгіңіз келе ме?"),
            actions: [
              TextButton(
                onPressed: () {
                  Clipboard.setData(ClipboardData(text: phone));
                  Navigator.of(context).pop();
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Нөмір алмасу буферіне көшірілді.'),
                      backgroundColor: Colors.green,
                    ),
                  );
                },
                child: Text('Нөмірді көшіру'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(),
                child: Text('Бас тарту'),
              ),
            ],
          );
        },
      );
    }
  }

  Color getOrderStatusColor(String status) {
    switch (status) {
      case 'DELIVERED':
        return Colors.green;
      case 'ON_ROAD':
        return Colors.orange;
      case 'RETURNED ':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        body: Center(
          child: CircularProgressIndicator(
            color: Colors.green,
          ),
        ),
      );
    }

    // Si la liste des commandes est vide, afficher le widget EmptyCart
    if (_orders.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: EmptyCart(), // Assurez-vous que ce widget est défini
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.white,
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: ListView.builder(
          itemCount: _orders.length,
          itemBuilder: (context, index) {
            final order = _orders[index];
            final status = order['status'] ?? 'Белгісіз';
            final statusColor = getOrderStatusColor(status);
            final totalPrice = order['totalPrice'] ?? '0';
            final locationName = order['locationName'] ?? 'Орналасу белгісіз';
            final orderItems = order['orderItems'] ?? [];
            bool isDetailsExpanded = _expandedItems[index] ?? false;

            return Card(
              elevation: 0,
              shadowColor: Colors.black54,
              color: Colors.greenAccent,
              margin: EdgeInsets.only(bottom: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Тапсырыс #${order['id']}',
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: 'SF-Pro-Text-Bold',
                            color: Colors.black,
                          ),
                        ),
                        Text(
                          '${status.replaceAll("_", " ")}',
                          style: TextStyle(
                            fontSize: 14,
                            fontFamily: 'SF-Pro-Text-Semibold',
                            color: statusColor,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 8),
                    GestureDetector(
                      onTap: () {
                        setState(() {
                          _expandedItems[index] = !isDetailsExpanded;
                        });
                      },
                      child: Row(
                        children: [
                          Text(
                            'Тапсырыс туралы мәлімет',
                            style: TextStyle(
                                fontSize: 14,
                                fontFamily: 'SF-Pro-Text-Regular',
                                color: Colors.black),
                          ),
                          Icon(
                            color: Colors.black,
                            isDetailsExpanded
                                ? Icons.expand_less
                                : Icons.expand_more,
                          ),
                        ],
                      ),
                    ),
                    if (isDetailsExpanded) ...[
                      SizedBox(height: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: orderItems.map<Widget>((item) {
                          return Padding(
                            padding: EdgeInsets.all(8),
                            child: Row(
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: Image.network(
                                    item['product']['mainImage'],
                                    width: 100,
                                    height: 100,
                                    fit: BoxFit.cover,
                                  ),
                                ),
                                SizedBox(width: 12),
                                Expanded(
                                  child: Container(
                                    height: 100,
                                    child: Column(
                                      crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          '${item['product']['name']}',
                                          style: TextStyle(
                                            fontSize: 16,
                                            fontFamily: 'SF-Pro-Text-Bold',
                                            color: Colors.black,
                                          ),
                                        ),
                                        SizedBox(height: 4),
                                        Text(
                                          '${item['quantity']} x ${item['product']['price']} тг',
                                          style: TextStyle(
                                            fontSize: 14,
                                            fontFamily: 'SF-Pro-Text-Regular',
                                            color: Colors.black,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }).toList(),
                      ),
                    ],
                    SizedBox(height: 16),
                    GestureDetector(
                      onTap: () => openGoogleMaps(order['location']),
                      child:Row(
                        children: [
                          Icon(
                            Icons.location_on,
                            color: Colors.black,
                          ),
                          SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              locationName,
                              style: TextStyle(
                                fontSize: 13,
                                fontFamily: 'SF-Pro-Text-Regular',
                                color: Colors.black,
                              ),
                              softWrap: true,
                              overflow: TextOverflow.ellipsis,
                              maxLines: 2,
                            ),
                          ),
                        ],
                      ),

                    ),
                    SizedBox(height: 16),
                    Text(
                      'Жалпы сома: ${totalPrice} тг',
                      style: TextStyle(
                        fontSize: 16,
                        fontFamily: 'SF-Pro-Text-Bold',
                        color: Colors.black,
                      ),
                    ),
                    Divider(height: 24, color: Colors.white),
                    Row(children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(30),
                          ),
                        ),
                        onPressed: () => openGoogleMaps(order['location']),
                        child: Text("Google Maps арқылы жол табу"),
                      ),
                      SizedBox(width: 5),
                      ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: successColor,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(30),
                            ),
                          ),
                          onPressed: () => CallCustemer(order['customer']['phone']),
                          child: Icon(Icons.phone)),],),
                    Divider(height: 24,color: Colors.white),
                    if (status != 'DELIVERED' && status != 'RETURNED') ...[
                      Center(
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            MaterialButton(
                              color: successColor,
                              child: Text("DELIVERED"),
                              textColor: Colors.white,
                              onPressed: () {
                                updateOrderStatus(order['id'], 'DELIVERED');
                              },
                            ),
                            SizedBox(width: 20),
                            MaterialButton(
                              color: Colors.red,
                              child: Text("RETURNED"),
                              textColor: Colors.white,
                              onPressed: () {
                                updateOrderStatus(order['id'], 'RETURNED');
                              },
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }}
