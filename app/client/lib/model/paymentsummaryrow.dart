import 'dart:ui';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';

class PaymentSummaryRow extends StatelessWidget {
  final String title;
  final double amount;
  final Color amountColor;
  final Color titleColor;
  final bool isStrikethrough;
  final String? amountTitle;

  const PaymentSummaryRow({
    super.key,
    required this.title,
    required this.amount,
    required this.amountColor,
    required this.titleColor,
    this.isStrikethrough = false,
    this.amountTitle, // New parameter
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(5.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(
              color: title == "Total" ? Colors.black : Colors.black54, // Total in black
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
          Row(
            children: [
              if (amountTitle != null && title != "Total")
                Text(
                  amountTitle!, // This will display "Rs." for other rows
                  style: const TextStyle(
                    color: Colors.black54,
                    fontSize: 14,
                    fontWeight: FontWeight.w400,
                  ),
                ),
              const SizedBox(width: 5),
              Text(
                title == "Total"
                    ? 'Rs.${amount.toStringAsFixed(0)}'
                    : 'Rs.${amount.toStringAsFixed(0)}', // Display amount for other rows
                style: TextStyle(
                  color: title == "Total" ? Colors.black : Colors.black54, // Black for total amount
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  decoration: isStrikethrough ? TextDecoration.lineThrough : null,
                  decorationColor: amountColor,
                  decorationThickness: 2,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
