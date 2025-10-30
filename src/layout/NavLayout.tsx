import Navbar from "../components/Navbar";
import FallbackProfileBanner from "../components/FallbackProfileBanner";

export default function NavLayout({children}: {children: React.ReactNode}) {
    return (
        <>
            <FallbackProfileBanner />
            <Navbar />
            {children}
        </>
    )
}