export const Loading = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EB5A36]"></div>
    </div>
  )
}

export const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EB5A36] mx-auto"></div>
        <p className="mt-4 text-gray-600">로딩중...</p>
      </div>
    </div>
  )
}
