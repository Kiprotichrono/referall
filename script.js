document.addEventListener('DOMContentLoaded', function () {
    const referralBtn = document.getElementById('referralBtn');
    const message = document.getElementById('message');
    const pointsDisplay = document.getElementById('points');
  
    let currentUser;
  
    // Initialize Firestore and Auth
    auth.onAuthStateChanged(user => {
      if (user) {
        currentUser = user;
        // Display the user's current points from Firestore
        getUserPoints(user.uid);
      } else {
        signInAnonymously();  // Use anonymous login to handle guest users
      }
    });
  
    // Handle Anonymous Authentication
    function signInAnonymously() {
      auth.signInAnonymously()
        .then((userCredential) => {
          currentUser = userCredential.user;
          getUserPoints(currentUser.uid);
        })
        .catch((error) => {
          message.textContent = `Error signing in: ${error.message}`;
        });
    }
  
    // Function to fetch the user's points from Firestore
    function getUserPoints(userId) {
      db.collection('users').doc(userId).get()
        .then((doc) => {
          if (doc.exists) {
            pointsDisplay.textContent = doc.data().points || 0;
          } else {
            // If user document doesn't exist, initialize it with 0 points
            db.collection('users').doc(userId).set({ points: 0 });
            pointsDisplay.textContent = 0;
          }
        });
    }
  
    // Create and share referral link
    referralBtn.addEventListener('click', function () {
      const referralLink = `${window.location.origin}?referrer=${currentUser.uid}`;
  
      if (navigator.share) {
        navigator.share({
          title: 'Join this awesome site!',
          text: 'Click this link and help me earn points!',
          url: referralLink,
        }).then(() => {
          message.textContent = 'Referral link shared successfully!';
        }).catch((error) => {
          message.textContent = 'Error sharing referral link.';
        });
      } else {
        message.textContent = 'Sharing is not supported in this browser.';
      }
    });
  
    // Check if the URL contains a referral and reward the referrer
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('referrer')) {
      const referrerId = urlParams.get('referrer');
      rewardReferrer(referrerId);
    }
  
    // Function to reward the referrer 50 points
    function rewardReferrer(referrerId) {
      db.collection('users').doc(referrerId).get()
        .then((doc) => {
          if (doc.exists) {
            let currentPoints = doc.data().points || 0;
            db.collection('users').doc(referrerId).update({
              points: currentPoints + 50
            }).then(() => {
              message.textContent = 'The referrer has been awarded 50 points!';
            });
          }
        });
    }
  });