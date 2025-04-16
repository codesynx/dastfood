import 'package:flutter/material.dart';

class HeaderWidget extends StatelessWidget {
  final String text; // Add a field for the text

  // Constructor to receive text
  HeaderWidget(String s, {required this.text});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        children: [
          SizedBox(height: 50),
          Image.asset('assets/images/logo1.png'),
          SizedBox(height: 15),
          Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.black, // Replace with your grayScale variable if needed
              fontSize: 24,
              fontFamily: "SF-Pro-Text-Semibold",
              fontWeight: FontWeight.bold,
              letterSpacing: 0.5,
            ),
          ),
        ],
      ),
    );
  }
}
