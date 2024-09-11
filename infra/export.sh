#!/bin/bash
output_dir="img"

count=$(grep -o "<diagram" "$1"  | wc -l) 
echo "Found $count diagrams"

# ファイル名（拡張子なし）を取得
export_file_prefix=$(basename "$1" | sed -e "s/\..*//")

# 図をエクスポート
for ((i = 0 ; i <= $count-1; i++)); do
	echo "Exporting diagram ${export_file_prefix}_${i}.png"
	docker run -it -w /data -v $(pwd):/data --rm rlespinasse/drawio-desktop-headless -xrf png -p "${i}" -o "${output_dir}/${export_file_prefix}_${i}.png" architecture.dio 
done
