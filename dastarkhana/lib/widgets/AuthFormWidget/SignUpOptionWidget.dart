import 'package:Dastarkhana/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:Dastarkhana/auth/Userauth/SignUpForm.dart';

class SignUpOptionWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(
          "Әлі тіркелмедіңіз бе? ",
          style: TextStyle(fontFamily: "SF-Pro-Text-Semibold"),
          textAlign: TextAlign.center,
        ),
        InkWell(
          onTap: () {
            Navigator.push(context, MaterialPageRoute(builder: (context) => SignUpForm()));
          },
          child: Text(
            " Тіркелу",
            style: TextStyle(color: successColor, fontFamily: "SF-Pro-Text-Semibold"), // Replace with your disabledButtonColor variable
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }
}
