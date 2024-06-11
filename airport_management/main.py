import csv
import json

# Define the input and output files
input_file = 'data.json'
output_file = 'flights.csv'

# Read the JSON data
with open(input_file, 'r') as jsonfile:
    data = json.load(jsonfile)

# Extract the relevant fields and write to CSV
with open(output_file, 'w', newline='') as csvfile:
    csvwriter = csv.writer(csvfile)
    # Write the header
    csvwriter.writerow(['Departure Airport', 'Arrival Airport', 'Airline'])
    
    # Write the data
    for row in data:
        departure_airport = row[0]
        arrival_airport = row[1]
        airline = row[-1]
        csvwriter.writerow([departure_airport, arrival_airport, airline])

print(f"Data has been written to {output_file}")