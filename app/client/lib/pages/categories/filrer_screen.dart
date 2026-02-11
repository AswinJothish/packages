import 'package:flutter/material.dart';

class FilterScreen extends StatefulWidget {
  const FilterScreen({super.key});

  @override
  _FilterScreenState createState() => _FilterScreenState();
}

class _FilterScreenState extends State<FilterScreen> {
  String selectedBrand = 'Sunstar';
  List<String> capacityOptions = ['7L Below', '14.1L & Above'];
  List<String> selectedCapacities = [];
  List<String> typeOptions = ['Electrical & Non - storage', 'Electrical & storage'];
  List<String> selectedTypes = [];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7F6F6),
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text('Filter', style: TextStyle(color: Colors.black)),
        backgroundColor: const Color(0xFFF7F6F6),
        elevation: 0,
      ),
      body:
      Container(
        child: Column(
          children: [
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: const Color(0xFF1C4E91))
                ),
                child: ListView(
                  children: [
                    const Text('BRAND', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: ['Aqua', 'Sunstar', 'Products'].map((brand) {
                        return ChoiceChip(
                          label: Text(brand),
                          selected: selectedBrand == brand,
                          onSelected: (selected) {
                            setState(() {
                              selectedBrand = brand;
                            });
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    const Text('CAPACITY', style: TextStyle(fontWeight: FontWeight.bold)),
                    ...capacityOptions.map((option) {
                      return CheckboxListTile(
                        title: Text(option),
                        value: selectedCapacities.contains(option),
                        onChanged: (value) {
                          setState(() {
                            if (value!) {
                              selectedCapacities.add(option);
                            } else {
                              selectedCapacities.remove(option);
                            }
                          });
                        },
                      );
                    }),
                    const SizedBox(height: 16),
                    const Text('TYPE', style: TextStyle(fontWeight: FontWeight.bold)),
                    ...typeOptions.map((option) {
                      return CheckboxListTile(
                        title: Text(option),
                        value: selectedTypes.contains(option),
                        onChanged: (value) {
                          setState(() {
                            if (value!) {
                              selectedTypes.add(option);
                            } else {
                              selectedTypes.remove(option);
                            }
                          });
                        },
                      );
                    }),
                  ],
                ),
              ),
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                onPressed: () {
                  // Apply filter logic here
                },
                child: Text('Apply Filter'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}