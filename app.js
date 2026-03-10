//  Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyD0sk0HMhE_gCh4yXBNGLUStm9I-oOEy7E",
  authDomain: "parkease-manager-eb15b.firebaseapp.com",
  projectId: "parkease-manager-eb15b",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ======================
   LOGIN
====================== */
function login() {
  const code = eventCode.value.trim();
  const pinVal = pin.value.trim();

  db.collection("events")
    .where("eventCode", "==", code)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        error.innerText = "Invalid Event Code";
        return;
      }

      const doc = snapshot.docs[0];
      if (doc.data().pin !== pinVal) {
        error.innerText = "Wrong PIN";
        return;
      }

      localStorage.setItem("eventId", doc.id);
      window.location.href = "dashboard.html";
    });
}

/* ======================
   DASHBOARD LIVE UPDATE
====================== */
const eventId = localStorage.getItem("eventId");

if (eventId) {
  db.collection("events").doc(eventId).onSnapshot(doc => {
    const d = doc.data();

    eventName.innerText = d.eventName;
    total.innerText = d.totalSlots;
    online.innerText = d.onlineBookings;
    walkin.innerText = d.walkInCount;

    available.innerText =
      d.totalSlots - d.onlineBookings - d.walkInCount;

    // Optional visual hint if parking is closed
    if (!d.parkingOpen) {
      available.innerText = "CLOSED";
    }
  });
}

/* ======================
   ADD WALK-IN
====================== */
function addWalkIn() {
  const ref = db.collection("events").doc(eventId);

  ref.get().then(doc => {
    const d = doc.data();

    // 🔴 NEW CHECK: parking closed
    if (!d.parkingOpen) {
      alert("🚫 Parking Closed");
      return;
    }

    const available =
      d.totalSlots - d.onlineBookings - d.walkInCount;

    if (available <= 0) {
      alert("🚫 Parking Full");
      return;
    }

    ref.update({
      walkInCount: firebase.firestore.FieldValue.increment(1)
    });
  });
}

/* ======================
   CAR EXIT
====================== */
function carExit() {
  const ref = db.collection("events").doc(eventId);

  ref.get().then(doc => {
    const d = doc.data();

    // 🔴 NEW CHECK: parking closed
    if (!d.parkingOpen) {
      alert("🚫 Parking Closed");
      return;
    }

    const walkIns = d.walkInCount;

    if (walkIns <= 0) {
      alert("No cars to remove");
      return;
    }

    ref.update({
      walkInCount: firebase.firestore.FieldValue.increment(-1)
    });
  });
}

    
