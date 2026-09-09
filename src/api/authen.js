export async function register({ email, password }) {
  throw new Error('authen.register not implemented');
}

  export async function login({ email, password }) {
  throw new Error('authen.login not implemented');
};

export async function logout(refreshToken) {
  throw new Error('authen.logout not implemented');
}

  export async function refresh(refreshToken) {
  throw new Error('authen.refresh not implemented');
  }

  export async function getMe(accessToken) {
  throw new Error('authen.getMe not implemented');
  }