export default function Footer() {
  return (
    <footer className="border-t-1 border-t-black flex justify-center items-center bg-black text-white">
      <h3 className="text-lg text-center">
        ShoShop © {new Date().getFullYear()}
      </h3>
    </footer>
  )
}
