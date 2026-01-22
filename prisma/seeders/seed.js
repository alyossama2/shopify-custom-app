import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const fuelTypes = await Promise.all([
    prisma.carFuelType.upsert({
      where: { id: 1 },
      update: {},
      create: { name: 'Gasoline' },
    }),
    prisma.carFuelType.upsert({
      where: { id: 2 },
      update: {},
      create: { name: 'Diesel' },
    }),
    prisma.carFuelType.upsert({
      where: { id: 3 },
      update: {},
      create: { name: 'Electric' },
    }),
    prisma.carFuelType.upsert({
      where: { id: 4 },
      update: {},
      create: { name: 'Hybrid' },
    }),
    prisma.carFuelType.upsert({
      where: { id: 5 },
      update: {},
      create: { name: 'Hydrogen' },
    }),
  ]);


  const cars = [
    { brand: 'Toyota', licensePlace: 'ABC-1234', year: 2020, fuelTypeId: 1, driverName: 'John Smith' },
    { brand: 'Honda', licensePlace: 'XYZ-5678', year: 2019, fuelTypeId: 1, driverName: 'Jane Doe' },
    { brand: 'Tesla', licensePlace: 'ELC-9999', year: 2023, fuelTypeId: 3, driverName: 'Bob Johnson' },
    { brand: 'Ford', licensePlace: 'DEF-2468', year: 2021, fuelTypeId: 2, driverName: 'Alice Williams' },
    { brand: 'BMW', licensePlace: 'GHI-1357', year: 2022, fuelTypeId: 1, driverName: 'Charlie Brown' },
    { brand: 'Volkswagen', licensePlace: 'JKL-8642', year: 2020, fuelTypeId: 2, driverName: 'Diana Prince' },
    { brand: 'Nissan', licensePlace: 'MNO-7531', year: 2021, fuelTypeId: 4, driverName: 'Edward Norton' },
    { brand: 'Mercedes-Benz', licensePlace: 'PQR-9513', year: 2023, fuelTypeId: 1, driverName: 'Fiona Apple' },
    { brand: 'Audi', licensePlace: 'STU-3579', year: 2022, fuelTypeId: 2, driverName: 'George Lucas' },
    { brand: 'Hyundai', licensePlace: 'VWX-4680', year: 2020, fuelTypeId: 4, driverName: 'Helen Keller' },
    { brand: 'Chevrolet', licensePlace: 'YZA-8024', year: 2021, fuelTypeId: 1, driverName: 'Ian Fleming' },
    { brand: 'Mazda', licensePlace: 'BCD-6042', year: 2022, fuelTypeId: 1, driverName: 'Julia Roberts' },
    { brand: 'Subaru', licensePlace: 'EFG-4206', year: 2023, fuelTypeId: 2, driverName: 'Kevin Spacey' },
    { brand: 'Kia', licensePlace: 'HIJ-8402', year: 2020, fuelTypeId: 4, driverName: 'Laura Palmer' },
    { brand: 'Lexus', licensePlace: 'KLM-2064', year: 2021, fuelTypeId: 4, driverName: 'Michael Jackson' },
  ];

  for (const car of cars) {
    await prisma.car.upsert({
      where: { licensePlace: car.licensePlace },
      update: car,
      create: car,
    });
  }

}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });