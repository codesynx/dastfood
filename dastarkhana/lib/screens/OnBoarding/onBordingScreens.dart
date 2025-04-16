import 'package:Dastarkhana/screens/OnBoarding/RoleScreen.dart';
import 'package:flutter/material.dart';
import 'package:smooth_page_indicator/smooth_page_indicator.dart';
import '../../widgets/OnBoardingWidget/onBoardingWidget.dart';
import '../../utils/colors.dart';

class OnBoardingScreens extends StatefulWidget {
  const OnBoardingScreens({super.key});

  @override
  State<OnBoardingScreens> createState() => _OnBoardingScreensState();
}

class _OnBoardingScreensState extends State<OnBoardingScreens> {
  final PageController _pageController = PageController();
  int currentPage = 0;

  @override
  Widget build(BuildContext context) {
    // Get screen dimensions
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Expanded(
            child: PageView(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  currentPage = index;
                });
              },
              children: [
                OnboardingPage(
                  image: "assets/images/1.png",
                  text: 'Dastarkhana-мен дәм сапарын бастаңыз!',
                  description:
                  "Үздік мейрамханадан дәмді тағамдарға тапсырыс беріңіз және үйіңізге дейін жеткізілуін тамашалаңыз.",
                  pageIndex: 0,
                  pageController: _pageController, // Pass the PageController
                ),
                OnboardingPage(
                  image: "assets/images/3.png",
                  text: 'Жаңа тағамдарды ашыңыз!',
                  description:
                  "Әртүрлі ас мәзірлерін зерттеп, сүйікті тағамдарыңызды табыңыз. Dastarkhana бәрін бір қолданбада жинады!",
                  pageIndex: 1,
                  pageController: _pageController, // Pass the PageController
                ),
                OnboardingPage(
                  image: "assets/images/2.png",
                  text: 'Тапсырысты ләззатпен рәсімдеңіз!',
                  description:
                  "Тапсырыс беру ешқашан мұншалықты оңай әрі ыңғайлы болмаған. Ең жақсы тағамдар бір рет басқанда қолыңызда!",
                  pageIndex: 2,
                  pageController: _pageController, // Pass the PageController
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          SmoothPageIndicator(
            controller: _pageController,
            count: 3,
            effect: ExpandingDotsEffect(
              dotHeight: screenHeight * 0.01, // Responsive dot size
              dotWidth: screenHeight * 0.01, // Responsive dot size
              activeDotColor: successColor,
              dotColor: disabledColor,
              expansionFactor: 3,
            ),
          ),
          SizedBox(height: screenHeight * 0.03), // Responsive spacing
        ],
      ),
    );
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }
}
