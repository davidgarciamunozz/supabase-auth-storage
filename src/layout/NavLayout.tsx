import Navbar from "../components/Navbar";

export default function NavLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            <Navbar />
            {children}
        </>
    )
}