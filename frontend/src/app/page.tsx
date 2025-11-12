'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // focus first input on tab change
    const selector = isLogin ? '#email-login' : '#name-signup';
    const el = document.querySelector<HTMLInputElement>(selector);
    el?.focus();
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
      await router.push('/dashboard');
    } else {
      await register({ email, password, name });
      await router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* LEFT: Brand */}
        <div className="hidden md:flex flex-col justify-center gap-6 p-12 bg-gradient-to-br from-emerald-600 to-teal-500 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white bg-opacity-15 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold tracking-tight">Ecommerce</h3>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-emerald-100 max-w-xs">
            Fast, secure sign-in and sign-up with a clean, responsive UI.
          </p>

          <div aria-hidden className="mt-4 w-full">
            <svg viewBox="0 0 600 200" className="w-full h-28 opacity-80" preserveAspectRatio="xMidYMid meet">
              <defs>
                <linearGradient id="g2" x1="0" x2="1">
                  <stop offset="0" stopColor="rgba(255,255,255,0.15)" />
                  <stop offset="1" stopColor="rgba(255,255,255,0.06)" />
                </linearGradient>
              </defs>
              <rect x="0" y="0" width="600" height="200" fill="url(#g2)" rx="12" />
            </svg>
          </div>
        </div>

        {/* RIGHT: Form column (clip the sliding track) */}
        <div className="p-8 md:p-12 flex items-center justify-center min-w-0 relative z-10 overflow-hidden">
          <div className="w-full max-w-md">
            {/* Tabs (pill uses translate utilities) */}
            <div className="bg-gray-100 rounded-xl p-1 mb-6">
              <div className="relative rounded-lg overflow-hidden">
                <div
                  className={`absolute inset-y-1 left-0 w-1/2 bg-white rounded-md shadow-sm transform transition-transform duration-400 ease-out ${
                    isLogin ? 'translate-x-0' : 'translate-x-full'
                  }`}
                  aria-hidden
                />
                <div role="tablist" className="relative grid grid-cols-2 text-sm font-semibold">
                  <button
                    role="tab"
                    aria-selected={isLogin}
                    onClick={() => setIsLogin(true)}
                    className={`py-3 px-6 text-center rounded-md z-10 ${
                      isLogin ? 'text-emerald-700' : 'text-gray-600'
                    }`}
                  >
                    Sign in
                  </button>
                  <button
                    role="tab"
                    aria-selected={!isLogin}
                    onClick={() => setIsLogin(false)}
                    className={`py-3 px-6 text-center rounded-md z-10 ${
                      !isLogin ? 'text-emerald-700' : 'text-gray-600'
                    }`}
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {isLogin ? 'Enter your details below.' : 'It only takes a minute.'}
            </p>

            {/* VIEWPORT that clips track */}
            <div className="relative w-full overflow-hidden">
              {/* TRACK: width=200% so each pane equals viewport width */}
              <div
                ref={trackRef}
                className={`flex w-[200%] gap-2 px-4 transition-transform duration-500 ease-in-out`}
                aria-hidden={false}
              >
                {/* Pane 1: Login — flex-none w-1/2 ensures pane = viewport width */}
                <div className="flex-none w-1/2 px-0">
                  <form onSubmit={handleSubmit} className="space-y-5 px-0" aria-hidden={!isLogin}>
                    <div>
                      <label htmlFor="email-login" className="text-sm font-medium text-gray-700 block mb-1">
                        Email
                      </label>
                      <input
                        id="email-login"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password-login" className="text-sm font-medium text-gray-700 block mb-1">
                        Password
                      </label>
                      <input
                        id="password-login"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => setIsLogin(false)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Create account
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      >
                        {isLoading ? (
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-200"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : null}
                        Sign in
                      </button>
                    </div>
                  </form>
                </div>

                {/* Pane 2: Register */}
                <div className="flex-none w-1/2 px-0">
                  <form onSubmit={handleSubmit} className="space-y-5 px-0" aria-hidden={isLogin}>
                    <div>
                      <label htmlFor="name-signup" className="text-sm font-medium text-gray-700 block mb-1">
                        Full name
                      </label>
                      <input
                        id="name-signup"
                        name="name"
                        type="text"
                        required={!isLogin}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                        placeholder="Jane Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="email-signup" className="text-sm font-medium text-gray-700 block mb-1">
                        Email
                      </label>
                      <input
                        id="email-signup"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password-signup" className="text-sm font-medium text-gray-700 block mb-1">
                        Password
                      </label>
                      <input
                        id="password-signup"
                        name="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                        placeholder="Create a password"
                      />
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => setIsLogin(true)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Already have an account?
                      </button>

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 px-5 py-3 text-white font-medium shadow focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                      >
                        {isLoading ? (
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-200"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden
                          >
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : null}
                        Create account
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* pager */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                aria-label="Go to sign in"
                onClick={() => setIsLogin(true)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${isLogin ? 'bg-emerald-600 scale-125' : 'bg-gray-300'}`}
              />
              <button
                aria-label="Go to sign up"
                onClick={() => setIsLogin(false)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${!isLogin ? 'bg-emerald-600 scale-125' : 'bg-gray-300'}`}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
