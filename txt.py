#!/usr/bin/env python
import re
import os
from collections import defaultdict

def normalize_rf_to_logreg(input_file, output_file):
    """把 RF 格式 [COIN DATE] → ... 轉換成 LogReg 的格式"""
    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    coin_results = defaultdict(list)

    for line in lines:
        if "→ 預測:" not in line:
            continue
        # ['DOGE' '2024-12-04'] → 預測: 🟡  真實: 🟡  結果: ✅
        m = re.match(r"\['(\w+)'\s+'(\d{4}-\d{2}-\d{2})']\s*→\s*(.*)", line.strip())
        if m:
            coin, date, rest = m.groups()
            coin_results[coin].append(f"{date} → {rest}")

    with open(output_file, "w", encoding="utf-8") as f:
        for coin in sorted(coin_results.keys()):
            f.write(f"=== {coin} ===\n")
            for entry in coin_results[coin]:
                f.write(entry + "\n")
            f.write("\n")


def normalize_logreg_keep(input_file, output_file):
    """LogReg 檔案已經是目標格式，直接複製"""
    with open(input_file, "r", encoding="utf-8") as f:
        lines = f.readlines()

    with open(output_file, "w", encoding="utf-8") as f:
        f.writelines(lines)


if __name__ == "__main__":
    rf_input = "client/public/data/rf_classifier2_results.txt"
    logreg_input = "client/public/data/logreg_combined_classifier_2_results.txt"

    rf_output = "client/public/data/rf_as_logreg.txt"
    logreg_output = "client/public/data/logreg_as_logreg.txt"

    normalize_rf_to_logreg(rf_input, rf_output)
    normalize_logreg_keep(logreg_input, logreg_output)

    print(f"轉換完成：\n - {rf_output}\n - {logreg_output}")
