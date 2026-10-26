const mongoose = require('mongoose');
require('dotenv').config();
const Case = require('./models/Case');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Connected for seeding..."))
  .catch(err => console.log(err));

const sampleCase = {
  title: "The Midnight Tech Heist",
  description: "Lead developer Alex Vance was found locked in his smart office. His prototype AI core was stolen from the server room at midnight. No doors were forced open.",
  status: "Open",
  suspects: [
    { name: "Dr. Evelyn Reed", alibi: "Claimed she was in the cafeteria drinking coffee.", motive: "Wanted sole ownership of the AI core patent.", isGuilty: true },
    { name: "Marcus Brody", alibi: "Working late in the hardware lab on floor 2.", motive: "Fired last month; owed $50k in back pay.", isGuilty: false }
  ],
  evidence: [
    { itemName: "Security Log #402", description: "Server room door access card used at 11:58 PM.", clueDetails: "Card belonged to Dr. Evelyn Reed, but she claimed she lost it earlier that day." },
    { itemName: "Coffee Mug", description: "Found on Alex's desk with traces of sleeping sedative.", clueDetails: "Fingerprints on the cup match Marcus Brody." }
  ]
};

const seedDB = async () => {
  await Case.deleteMany({});
  await Case.create(sampleCase);
  console.log("🕵️‍♂️ Mystery Case Seeded into MongoDB Successfully!");
  mongoose.connection.close();
};

seedDB();