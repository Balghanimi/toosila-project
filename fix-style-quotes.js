const fs = require('fs');
const path = require('path');

// List of files to process
const files = [
  'client/src/pages/offers/ViewOffers.js',
  'client/src/pages/Home.js',
  'client/src/pages/BadRatings.js',
  'client/src/components/Navegation/header.jsx',
  'client/src/pages/offers/PostOffer.js',
  'client/src/pages/UserRatings.js',
  'client/src/pages/TopRatings.js',
  'client/src/pages/TestAPI.jsx',
  'client/src/pages/SimpleTestAPI.jsx',
  'client/src/pages/Settings.js',
  'client/src/pages/RecentRatings.js',
  'client/src/pages/RatingStats.js',
  'client/src/pages/RatingsByUserType.js',
  'client/src/pages/RatingsByRating.js',
  'client/src/pages/RatingsByLocation.js',
  'client/src/pages/RatingsByDate.js',
  'client/src/pages/RatingsByComments.js',
  'client/src/pages/RatingManagement.js',
  'client/src/pages/Profile.js',
  'client/src/pages/PrivacyPolicy.js',
  'client/src/pages/offers/PostOfferModern.js',
  'client/src/pages/NotificationsPage.jsx',
  'client/src/pages/Messages.js',
  'client/src/pages/Download.js',
  'client/src/pages/demands/ViewDemands.js',
  'client/src/pages/demands/PostDemand.js',
  'client/src/pages/Dashboard.js',
  'client/src/pages/Contact.js',
  'client/src/pages/Bookings.js',
  'client/src/pages/AdminTest.js',
  'client/src/pages/admin/UserManagement.js',
  'client/src/pages/About.js',
  'client/src/context/NotificationContext.js',
  'client/src/components/UI/Alert.jsx',
  'client/src/components/SettingsModals.jsx',
  'client/src/components/RatingModal.js',
  'client/src/components/RatingDisplay.js',
  'client/src/components/notifications/NotificationDropdown.jsx',
  'client/src/components/notifications/NotificationBell.jsx',
  'client/src/components/NotificationBell.jsx',
  'client/src/components/DemandResponsesList.jsx',
  'client/src/components/DemandResponseForm.jsx',
  'client/src/components/DateTimeSelector.js',
  'client/src/components/Chat/MessageSearch.js',
  'client/src/components/Chat/MessageList.js',
  'client/src/components/Chat/MessageInput.js',
  'client/src/components/Chat/ConversationList.js',
  'client/src/components/Chat/ChatInterface.js',
  'client/src/components/BottomNav.js',
  'client/src/components/BookingModal.js',
  'client/src/components/Auth/UserProfile.js',
  'client/src/components/Auth/UserMenu.js',
  'client/src/components/Auth/Register.js',
  'client/src/components/Auth/PhoneAuth.js',
  'client/src/components/Auth/Login.js',
];

let totalFiles = 0;
let totalChanges = 0;
let filesWithChanges = 0;

console.log('Reverting broken changes and applying correct fix...\n');

files.forEach((file) => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠ File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fileChanges = 0;

  // First, fix any broken font-family syntax from previous attempt
  // fontFamily: ""Cairo", sans-serif" -> fontFamily: '"Cairo", sans-serif'
  content = content.replace(/fontFamily:\s*""([^"]+)",\s*([^"]+)"/g, (match, p1, p2) => {
    fileChanges++;
    return `fontFamily: '"${p1}", ${p2}'`;
  });

  // Now properly convert single quotes to double quotes in style objects
  // This handles simple string values like: position: 'absolute'
  // But preserves complex values like: fontFamily: '"Cairo", sans-serif'
  content = content.replace(/(\w+):\s*'([^']*?)'/g, (match, prop, value) => {
    // Skip if value contains quotes (like font-family with multiple fonts)
    if (value.includes('"') || value.includes(',')) {
      return match;
    }
    fileChanges++;
    return `${prop}: "${value}"`;
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    filesWithChanges++;
    totalChanges += fileChanges;
    console.log(`✓ Fixed ${file} (${fileChanges} changes)`);
  }

  totalFiles++;
});

console.log('\n' + '='.repeat(50));
console.log(`Summary:`);
console.log(`  Total files processed: ${totalFiles}`);
console.log(`  Files with changes: ${filesWithChanges}`);
console.log(`  Total changes applied: ${totalChanges}`);
console.log('='.repeat(50));
