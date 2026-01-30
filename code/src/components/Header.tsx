import { Link, useNavigate } from "@tanstack/react-router";
import { Home, LogOut, Menu, Network, ShoppingCart, X } from "lucide-react";
import { useState } from "react";
import { supabaseClient } from "@/db/supabase.client";

export default function Header() {
	const [isOpen, setIsOpen] = useState(false);
	const navigate = useNavigate();

	const handleLogout = async () => {
		await supabaseClient.auth.signOut();
		setIsOpen(false);
		navigate({ to: "/auth" });
	};

	return (
		<>
			<header className="p-4 flex items-center justify-between bg-gray-800 text-white shadow-lg">
				<div className="flex items-center">
					<button
						type="button"
						onClick={() => setIsOpen(true)}
						className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
						aria-label="Open menu"
					>
						<Menu size={24} />
					</button>
					<h1 className="ml-4 text-xl font-semibold">QuickShop</h1>
				</div>
			</header>

			<aside
				className={`fixed top-0 left-0 h-full w-80 bg-gray-900 text-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
					isOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				<div className="flex items-center justify-between p-4 border-b border-gray-700">
					<h2 className="text-xl font-bold">Menu</h2>
					<button
						type="button"
						onClick={() => setIsOpen(false)}
						className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
						aria-label="Close menu"
					>
						<X size={24} />
					</button>
				</div>

				<nav className="flex-1 p-4 overflow-y-auto">
					<Link
						to="/lists"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
					>
						<ShoppingCart size={20} />
						<span className="font-medium">Moje Listy</span>
					</Link>

					<Link
						to="/"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
					>
						<Home size={20} />
						<span className="font-medium">Home</span>
					</Link>

					{/* Demo Links Start */}

					<Link
						to="/demo/tanstack-query"
						onClick={() => setIsOpen(false)}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors mb-2"
						activeProps={{
							className:
								"flex items-center gap-3 p-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors mb-2",
						}}
					>
						<Network size={20} />
						<span className="font-medium">TanStack Query</span>
					</Link>

					{/* Demo Links End */}
				</nav>

				<div className="p-4 border-t border-gray-700">
					<button
						type="button"
						onClick={handleLogout}
						className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors w-full text-left"
					>
						<LogOut size={20} />
						<span className="font-medium">Wyloguj się</span>
					</button>
				</div>
			</aside>
		</>
	);
}
