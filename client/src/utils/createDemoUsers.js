// Utility to create demo users for testing
export function createDemoUsers() {
  const demoUsers = [
    {
      id: 'demo_driver_1',
      name: 'أحمد محمد',
      email: 'driver@test.com',
      phone: '07701234567',
      userType: 'driver',
      createdAt: new Date('2024-01-15').toISOString(),
      verified: true,
      rating: 4.8,
      tripsCount: 45,
      avatar: null
    },
    {
      id: 'demo_passenger_1',
      name: 'فاطمة علي',
      email: 'passenger@test.com',
      phone: '07807654321',
      userType: 'passenger',
      createdAt: new Date('2024-02-10').toISOString(),
      verified: true,
      rating: 4.6,
      tripsCount: 23,
      avatar: null
    },
    {
      id: 'demo_driver_2',
      name: 'محمد حسن',
      email: 'driver2@test.com',
      phone: '07901111111',
      userType: 'driver',
      createdAt: new Date('2024-01-20').toISOString(),
      verified: true,
      rating: 4.9,
      tripsCount: 67,
      avatar: null
    },
    {
      id: 'demo_passenger_2',
      name: 'سارة أحمد',
      email: 'passenger2@test.com',
      phone: '07502222222',
      userType: 'passenger',
      createdAt: new Date('2024-03-01').toISOString(),
      verified: false,
      rating: 4.3,
      tripsCount: 12,
      avatar: null
    }
  ];

  // Check if demo users already exist
  const existingUsers = localStorage.getItem('users');
  if (!existingUsers) {
    localStorage.setItem('users', JSON.stringify(demoUsers));
    console.log('Demo users created successfully!');
    return demoUsers;
  } else {
    const users = JSON.parse(existingUsers);
    // Add demo users if they don't exist
    let updated = false;
    demoUsers.forEach(demoUser => {
      if (!users.find(u => u.email === demoUser.email)) {
        users.push(demoUser);
        updated = true;
      }
    });
    
    if (updated) {
      localStorage.setItem('users', JSON.stringify(users));
      console.log('Missing demo users added!');
    }
    
    return users;
  }
}

// Function to reset demo data (useful for development)
export function resetDemoData() {
  localStorage.removeItem('users');
  localStorage.removeItem('currentUser');
  localStorage.removeItem('offers');
  localStorage.removeItem('demands');
  localStorage.removeItem('ratings');
  
  createDemoUsers();
  console.log('Demo data reset successfully!');
}

