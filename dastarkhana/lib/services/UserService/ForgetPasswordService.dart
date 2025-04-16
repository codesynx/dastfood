import 'dart:convert';

import 'package:Dastarkhana/auth/Userauth/SignInForm.dart';
import 'package:Dastarkhana/auth/Userauth/VerifyResetCodePage.dart';
import 'package:Dastarkhana/auth/Userauth/updatePassword.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import '../../utils/api_constants.dart';

class ForgetPasswordService {
  static Future<void> sendEmail(String email, BuildContext context) async {
    final String apiUrl = ApiConstants.sendEmail;

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({'email': email}),
      );

      if (response.statusCode == 200) {
        print('Электрондық поштаңызға хат сәтті жіберілді: ${response.body}');

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Электрондық поштаңызды нұсқаулар үшін тексеріңіз.")),
        );
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => VerifyResetCodePage(email:email)));
      } else {
        final errorResponse = jsonDecode(response.body);
        String errorMessage = errorResponse['message'] ?? 'Хат жіберілмеді';
        print('Хат жіберілмеді: $errorMessage (status: ${response.statusCode})');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage)),
        );
      }
    } catch (e) {
      print('Хат жіберу кезінде қате кетті: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Қате орын алды. Кейінірек қайталап көріңіз.')),
      );
    }
  }

  static Future<void> validPassword(String email, String code, BuildContext context) async {
    final String apiUrl = ApiConstants.resetPassword;

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({'email': email, 'code': code}),
      );

      if (response.statusCode == 200) {
        print('Код сәтті тексерілді: ${response.body}');

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Код сәтті расталды. Құпиясөзіңізді жаңартыңыз.")),
        );
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (context) => updatePassword(email:email)));
      } else {
        final errorResponse = jsonDecode(response.body);
        String errorMessage = errorResponse['error'] ?? 'Кодты растау мүмкін болмады';
        print('Кодты растау мүмкін болмады: $errorMessage (status: ${response.statusCode})');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage)),
        );
      }
    } catch (e) {
      print('Кодты растау кезінде қате шықты: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Қате орын алды. Кейінірек қайталап көріңіз.')),
      );
    }
  }
  static Future<void> UpdatePassword(String email, String password, BuildContext context) async {
    final String apiUrl = ApiConstants.updatePasswordByEmail;

    try {
      final response = await http.post(
        Uri.parse(apiUrl),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: jsonEncode({'email': email, 'newPassword': password}),
      );

      if (response.statusCode == 200) {
        print('Құпиясөз сәтті жаңартылды: ${response.body}');

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Құпиясөз сәтті жаңартылды.")),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => SignInForm()),
        );
      } else {
        print('Электрондық поштада қате шықты: $email');
        // Print the response to debug
        print('Жауап: ${response.body}');

        // Extracting error message from the response
        final errorResponse = jsonDecode(response.body);
        String errorMessage = errorResponse['error'] ?? 'Құпиясөзді жаңарту мүмкін болмады';

        print('Құпиясөзді жаңарту мүмкін болмады: $errorMessage (status: ${response.statusCode})');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(errorMessage)),
        );
      }
    } catch (e) {
      print('Құпиясөзді жаңарту кезінде қате кетті: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Қате орын алды. Кейінірек қайталап көріңіз.')),
      );
    }
  }

  }

