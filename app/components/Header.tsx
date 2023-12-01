import SearchBar from './SearchBar'

// bu component server component
const Header = () => {
  return (
    <div className='h-54 bg-gradient-to-r from-[#0f1f47] to-[#5f6984] p-2'>
      <div className='text-center mt-5'>
        <h1 className='text-white text-5xl font-bold mb-2'>
          Find your table for any occasion
        </h1>
        <SearchBar /> {/* server component client component i render edebilir */}
      </div>
    </div>
  )
}

export default Header
