// Mock Firebase SDK for testing
module.exports = {
  auth: {
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
    currentUser: null
  },
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
      })),
      where: jest.fn(() => ({
        get: jest.fn()
      })),
      add: jest.fn()
    }))
  },
  functions: {
    httpsCallable: jest.fn()
  }
};