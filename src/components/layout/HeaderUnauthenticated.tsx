export function HeaderUnauthenticated() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a
              href="/"
              className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md"
            >
              FishCards
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <a
              href="/login"
              className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="hidden sm:inline">Logowanie</span>
              <span className="sm:hidden">Login</span>
            </a>
            <a
              href="/register"
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:shadow-md"
            >
              <span className="hidden sm:inline">Rejestracja</span>
              <span className="sm:hidden">Rejestruj</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
