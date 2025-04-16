import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:Dastarkhana/utils/colors.dart';
import 'package:Dastarkhana/products/MenuProducts.dart';

class CategoryWidget extends StatefulWidget {
  final List<dynamic> categories;

  const CategoryWidget({
    Key? key,
    required this.categories,
  }) : super(key: key);

  @override
  State<CategoryWidget> createState() => _CategoryWidgetState();
}

class _CategoryWidgetState extends State<CategoryWidget> {
  @override
  Widget build(BuildContext context) {
    if (widget.categories.isEmpty) {
      return const Center(child: Text('Категориялар жоқ'));
    }

    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text(
              'Категориялар',
              style: TextStyle(fontSize: 18, fontFamily: "SF-Pro-Text-Bold"),
            ),
            TextButton(
              onPressed: () {},
              child: const Text(
                'Барлығын көру',
                style: TextStyle(color: successColor, fontFamily: "SF-Pro-Text-Bold"),
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 4,
            childAspectRatio: 1,
          ),
          itemCount: widget.categories.length,
          itemBuilder: (context, index) {
            final category = widget.categories[index];
            return InkWell(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MenuProducts(data: category),
                  ),
                );
              },
              child: Column(
                children: [
                  CircleAvatar(
                    backgroundColor: Colors.green.withOpacity(0.1),
                    radius: 30,
                    child: Image.network(
                      category['image'],
                      height: 30,
                      width: 30,
                      fit: BoxFit.cover,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    category['name'],
                    style: const TextStyle(fontSize: 12),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}