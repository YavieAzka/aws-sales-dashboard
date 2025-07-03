import pandas as pd

# Baca file CSV
input_file = 'D:\Project\\aws-sales-dashboard\\aws-sales-dashboard-project\data\data-miniature3.csv'
output_file = 'data-miniature3_with_no.csv'

# Baca file tanpa header agar bisa menambahkan kolom "No"
df = pd.read_csv(input_file)

# Tambahkan kolom "No" dengan nomor urut
df.insert(0, 'No', range(1, len(df) + 1))

# Simpan ke file baru
df.to_csv(output_file, index=False)
print(f'Column "No" added successfully. Output saved to {output_file}')