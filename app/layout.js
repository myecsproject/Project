import './globals.css';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '../components/theme-provider';
import Navigation from '../components/navigation';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'HeartGuard - Heart Abnormality Detection',
  description: 'Advanced heart abnormality detection system for early diagnosis and monitoring',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <Navigation />
          <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-black dark:to-gray-900 transition-colors duration-300">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}