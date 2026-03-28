const USER_DATA_KEY = "omina_user_data";

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(USER_DATA_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStore(next) {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(next));
}

function ensureBucket(store, identity) {
  if (!store[identity]) {
    store[identity] = { savedPlaces: [], bookings: [] };
  }
  if (!Array.isArray(store[identity].savedPlaces)) {
    store[identity].savedPlaces = [];
  }
  if (!Array.isArray(store[identity].bookings)) {
    store[identity].bookings = [];
  }
  return store[identity];
}

export function getUserData(identity) {
  if (!identity) return { savedPlaces: [], bookings: [] };
  const store = readStore();
  return ensureBucket(store, identity);
}

export function savePlace(identity, place) {
  if (!identity || !place?.id) return null;
  const store = readStore();
  const bucket = ensureBucket(store, identity);
  const exists = bucket.savedPlaces.some((item) => item.id === place.id);
  if (!exists) {
    bucket.savedPlaces.unshift({
      ...place,
      savedAt: new Date().toISOString(),
    });
    bucket.savedPlaces = bucket.savedPlaces.slice(0, 100);
    writeStore(store);
  }
  return bucket.savedPlaces;
}

export function removePlace(identity, placeId) {
  if (!identity || !placeId) return [];
  const store = readStore();
  const bucket = ensureBucket(store, identity);
  bucket.savedPlaces = bucket.savedPlaces.filter((item) => item.id !== placeId);
  writeStore(store);
  return bucket.savedPlaces;
}

export function addBooking(identity, booking) {
  if (!identity || !booking) return null;
  const store = readStore();
  const bucket = ensureBucket(store, identity);
  const next = {
    id: booking.id || crypto.randomUUID(),
    ...booking,
    createdAt: new Date().toISOString(),
  };
  bucket.bookings.unshift(next);
  bucket.bookings = bucket.bookings.slice(0, 100);
  writeStore(store);
  return next;
}

export function cancelBooking(identity, bookingId) {
  if (!identity || !bookingId) return [];
  const store = readStore();
  const bucket = ensureBucket(store, identity);
  bucket.bookings = bucket.bookings.filter((item) => item.id !== bookingId);
  writeStore(store);
  return bucket.bookings;
}
