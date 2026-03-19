import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
	theme: "light",
	toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>(() => {
		const saved = localStorage.getItem("notily-theme") as Theme | null;
		return saved || "light";
	});

	useEffect(() => {
		const root = document.documentElement;
		root.classList.remove("light", "dark");
		root.classList.add(theme);
		localStorage.setItem("notily-theme", theme);
	}, [theme]);

	const toggleTheme = () => setTheme((t) => (t === "light" ? "dark" : "light"));

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	return useContext(ThemeContext);
}
