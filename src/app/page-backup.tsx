export default function Home() {
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Innoventory IP Management
        </h1>
        <p className="text-gray-600 mb-8">
          Your previous design is being restored...
        </p>
        <a 
          href="/login" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Go to Login
        </a>
        
        <div className="mt-8 bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
          <h3 className="font-semibold mb-4">Demo Credentials</h3>
          <div className="text-sm text-left">
            <p><strong>Admin:</strong></p>
            <p>admin@innoventory.com / admin123</p>
            <br />
            <p><strong>Sub-Admin:</strong></p>
            <p>subadmin@innoventory.com / subadmin123</p>
          </div>
        </div>
      </div>
    </div>
  )
}
