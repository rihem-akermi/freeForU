import bcrypt from "bcrypt";

const passwords = [
  "ahmed123",
  "sarra123",
  "mohamed123",
  "mariem123",
  "yassine123",
  "amira123",
  "walid123",
  "ines123",
  "houssem123",
  "nour123",
];

async function generateHashes() {
  console.log("SCRIPT STARTED");
  for (const password of passwords) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${password} -> ${hash}`);
  }
  console.log("SCRIPT FINISHED");
}

generateHashes();
// how to run the file :
// npx tsx hashedNewPasswords.ts
