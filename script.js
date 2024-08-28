document.addEventListener('DOMContentLoaded', function () {
  const referralBtn = document.getElementById('referralBtn');
  const message = document.getElementById('message');
  const pointsDisplay = document.getElementById('points');

  let currentUser;

  // Initialize Firebase Authentication and Firestore
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Sign in anonymously or with email/password
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      console.log("User signed in with UID:", user.uid);

      // Fetch and display user points from Firestore
      getUserPoints(user.uid);
    } else {
      signInAnonymously();  // Sign in anonymously if the user is not authenticated
    }
  });

  // Anonymous sign-in function (or use your preferred auth method)
  function signInAnonymously() {
    auth.signInAnonymously()
      .then((userCredential) => {
        currentUser = userCredential.user;
        console.log("Anonymous user signed in with UID:", currentUser.uid);

        // Initialize user in Firestore if they don't exist
        initializeUser(currentUser.uid);
        getUserPoints(currentUser.uid);
      })
      .catch((error) => {
        message.textContent = Error signing in anonymously: ${error.message};
      });
  }

  // Initialize user in Firestore (if not already present)
  function initializeUser(userId) {
    db.collection('users').doc(userId).get().then((doc) => {
      if (!doc.exists) {
        // Add user to Firestore with default values
        db.collection('users').doc(userId).set({
          points: 0,
          referralCode: userId  // You can use uid as referral code
        });
      }
    });
  }

  // Function to fetch user points from Firestore
  function getUserPoints(userId) {
    db.collection('users').doc(userId).get()
      .then((doc) => {
        if (doc.exists) {
          pointsDisplay.textContent = doc.data().points || 0;
        } else {
          // Initialize user points if not present
          initializeUser(userId);
          pointsDisplay.textContent = 0;
        }
      });
  }

  // Handle referral link sharing
  referralBtn.addEventListener('click', function () {
    const referralLink = ${window.location.origin}?referrer=${currentUser.uid};

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

  // Reward the referrer if a new user signs up through a referral link
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('referrer')) {
    const referrerId = urlParams.get('referrer');
    rewardReferrer(referrerId);
  }

  // Function to reward the referrer with 50 points
  function rewardReferrer(referrerId) {
    db.collection('users').doc(referrerId).get()
      .then((doc) => {
        if (doc.exists) {
          let currentPoints = doc.data().points || 0;

          // Check if the current user has already rewarded the referrer
          db.collection('users').doc(currentUser.uid).get().then((userDoc) => {
            if (!userDoc.exists  !userDoc.data().rewardedReferrers  !userDoc.data().rewardedReferrers.includes(referrerId)) {
              // Add 50 points to the referrer
              db.collection('users').doc(referrerId).update({
                points: currentPoints + 50
              }).then(() => {
                message.textContent = 'The referrer has been awarded 50 points!';
              });
                // Mark the referrer as rewarded for this user
              db.collection('users').doc(currentUser.uid).set({
                rewardedReferrers: firebase.firestore.FieldValue.arrayUnion(referrerId)
              }, { merge: true });
            } else {
              message.textContent = 'You have already rewarded this referrer.';
            }
          });
        }
      });
  }
});
