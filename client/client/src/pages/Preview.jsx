import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeftIcon, Loader } from 'lucide-react'
import ResumePreview from '../Components/resumePreview'
import api from '../configs/api'

const Preview = () => {

  const { resumeId } = useParams()

  const [isLoading, setIsLoading] = useState(true)
  const [resumeData, setResumeData] = useState(null)

  const loadResumeData = async () => {
    try{
      const { data } = await api.get('/api/resumes/public/' + resumeId)
      setResumeData(data.resume)
    }
    catch(error){
      console.log(error.message)
    }
    finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadResumeData()
  }, [resumeId])

  return resumeData ? (
    <div className='bg-slate-100'>
      <div className='max-w-3xl mx-auto py-10'>
        <ResumePreview 
          data={resumeData}
          template={resumeData.template}
          accentColor={resumeData.accent_color}
          removeBackground={resumeData.remove_background || false}
          classes='py-4 bg-white'
        />
      </div>
    </div>
  ) : (
    <div>
      {isLoading ? (
        <Loader className="animate-spin"/>
      ) : (
        <div className='flex flex-col items-center justify-center h-screen'>
          <p className='text-center text-6xl text-slate-400 font-medium'>Resume Not Found</p>

          <Link to="/" className='mt-6 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 m-1 ring-offset-1 ring-1 ring-green-400 flex items-center transition-colors'>
            <ArrowLeftIcon className='mr-2 size-4'/>
            Back to home page
          </Link>
        </div>
      )}
    </div>
  )
}

export default Preview