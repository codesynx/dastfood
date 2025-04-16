import 'package:flutter/material.dart';
import '../../services/UserService/ForgetPasswordService.dart';
import '../../widgets/AuthFormWidget/HeaderWidget.dart';

class VerifyResetCodePage extends StatefulWidget {
  final String email;

  const VerifyResetCodePage({super.key, required this.email}); // Correctly define the constructor

  @override
  _VerifyResetCodePageState createState() => _VerifyResetCodePageState();
}

class _VerifyResetCodePageState extends State<VerifyResetCodePage> {
  final TextEditingController _digit1Controller = TextEditingController();
  final TextEditingController _digit2Controller = TextEditingController();
  final TextEditingController _digit3Controller = TextEditingController();
  final TextEditingController _digit4Controller = TextEditingController();
  final TextEditingController _emailController = TextEditingController();

  final Color successColor = Colors.green;

  void _submitCode() {
    String code = _digit1Controller.text +
        _digit2Controller.text +
        _digit3Controller.text +
        _digit4Controller.text;

    if (code.length == 4) {
      print("Енгізілген код: $code");
      ForgetPasswordService.validPassword(
        widget.email, // Now this will work correctly
        code,
        context,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('4 цифрлық кодты енгізіңіз')),
      );
    }
  }

  Widget _buildCodeField(TextEditingController controller, bool autoFocus) {
    return Container(
      width: 50,
      height: 60,
      child: TextField(
        controller: controller,
        autofocus: autoFocus,
        keyboardType: TextInputType.number,
        maxLength: 1,
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: successColor),
        decoration: InputDecoration(
          counterText: "",
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: successColor),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide(color: successColor, width: 2.0),
          ),
        ),
        onChanged: (value) {
          if (value.length == 1) {
            FocusScope.of(context).nextFocus();
          }
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              HeaderWidget("Кіру", text: 'Құпия сөзді жаңарту кодын тексеру',),
              SizedBox(height: 80),
              Text(
                "Сізге электрондық поштаңызға жіберілген кодты енгізіңіз",
                style: TextStyle(fontSize: 18),
                textAlign: TextAlign.center,
              ),
              SizedBox(height: 30),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _buildCodeField(_digit1Controller, true),
                  _buildCodeField(_digit2Controller, false),
                  _buildCodeField(_digit3Controller, false),
                  _buildCodeField(_digit4Controller, false),
                ],
              ),
              SizedBox(height: 30),
              ElevatedButton(
                onPressed: _submitCode,
                child: Text("Тексеру", style: TextStyle(color: Colors.white)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: successColor,
                  padding: EdgeInsets.symmetric(horizontal: 80, vertical: 15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
