import 'package:flutter/material.dart';

class EmptyCart extends StatelessWidget {
  const EmptyCart({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              "assets/images/Frame.png",
              height: 180,
            ),
            SizedBox(height: 24),
            Text(
              "Себет бос",
              style: TextStyle(
                fontSize: 24,
                fontFamily: 'SF-Pro-Text-Bold',
                color: Colors.black,
              ),
            ),
            SizedBox(height: 8),
            Text(
              "Қазір сізде белсенді тапсырыс жоқ",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 16,
                fontFamily: 'SF-Pro-Text-Medium',
                color: Colors.grey[600],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
