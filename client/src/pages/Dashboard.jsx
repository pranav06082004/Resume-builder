import { FilePenLineIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloud, UploadCloudIcon, XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {

  const { user, token } = useSelector(state => state.auth)

  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navi = useNavigate()

  const colors = ['#6366F1', '#14B8A6', '#F59E0B', '#E11D48', '#06B6D4']


  // LOAD ALL RESUMES
  const loadAllresumes = async () => {
    try {
      const { data } = await api.get('/api/resumes/user-resumes', {
        headers: { Authorization: token }
      })

      setAllResumes(data.resumes)

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }


  // CREATE RESUME
  const createResume = async (e) => {
    e.preventDefault()

    try {
      const { data } = await api.post(
        '/api/resumes/create',
        { title },
        { headers: { Authorization: token } }
      )

      setAllResumes([...allResumes, data.resume])
      setTitle('')
      setShowCreateResume(false)

      navi(`/app/builder/${data.resume._id}`)

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }


  // UPLOAD RESUME
  const uploadResume = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {

      const resumeText = await pdfToText(resume)

      const { data } = await api.post(
        '/api/ai/upload-resume',
        { title, resumeText },
        { headers: { Authorization: token } }
      )

      setTitle('')
      setResume(null)
      setShowUploadResume(false)

      navi(`/app/builder/${data.resumeId}`)

    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }

    setIsLoading(false)
  }


  // DELETE RESUME
  const deleteResume = async (resumeId) => {

    const confirmDelete = window.confirm('Are you sure you want to delete this resume?')
    if (!confirmDelete) return

    try {

      await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: token }
      })

      setAllResumes(allResumes.filter(resume => resume._id !== resumeId))

    } 
    catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }


  const editTitle = async (e) => {
    try{
    e.preventDefault()
    const {data} = await api.put(`/api/resumes/update`, {resumeId: editResumeId, resumeData: {title}}, {headers :{
      Authorization : token
    }})
    setAllResumes(allResumes.map(resume => resume._id === editResumeId ? {...resume, title}: resume))
    setTitle('')
    setEditResumeId('')
    toast.success(data.message)
    
  }
  catch (error){
    toast.error(error?.response?.data?.message || error.message)
  }

}
  useEffect(() => {
    if (token) {
      loadAllresumes()
    }
  }, [token])


  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>

        <div className='flex gap-4'>

          <button
            onClick={() => setShowCreateResume(true)}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <PlusIcon className='size-11 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-indigo-600'>Create Resume</p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'
          >
            <UploadCloudIcon className='size-11 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
            <p className='text-sm group-hover:text-purple-600'>Upload Existing</p>
          </button>

        </div>


        <hr className='border-slate-300 my-6 sm:w-[305px]' />


        <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>

          {allResumes.map((resume, index) => {

            const baseColor = colors[index % colors.length]

            return (
              <button
                key={resume._id}
                onClick={() => navi(`/app/builder/${resume._id}`)}
                className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer'
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`,
                  borderColor: baseColor + '40'
                }}
              >

                <FilePenLineIcon className="size-7" style={{ color: baseColor }} />

                <p className='text-sm px-2 text-center' style={{ color: baseColor }}>
                  {resume.title}
                </p>

                <p className='absolute bottom-1 text-[11px] px-2 text-center'
                  style={{ color: baseColor + '90' }}>
                  Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                </p>

                <div
                  onClick={e => e.stopPropagation()}
                  className='absolute top-1 group-hover:flex items-center hidden'
                >
                  <TrashIcon
                    onClick={() => deleteResume(resume._id)}
                    className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700"
                  />

                  <PencilIcon
                    onClick={() => {
                      setEditResumeId(resume._id)
                      setTitle(resume.title)
                    }}
                    className="size-7 p-1.5 hover:bg-white/50 rounded text-slate-700"
                  />
                </div>

              </button>
            )
          })}

        </div>


        {/* CREATE RESUME MODAL */}
        {showCreateResume && (
          <div
            className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center'
            onClick={() => setShowCreateResume(false)}
          >

            <form
              onSubmit={createResume}
              onClick={e => e.stopPropagation()}
              className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'
            >

              <h2 className='text-xl font-bold mb-4'>Create a Resume</h2>

              <input
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                type="text"
                placeholder='Enter resume title'
                className='w-full px-4 py-2 mb-4 border rounded'
                required
              />

              <button className='w-full py-2 bg-green-600 text-white rounded'>
                Create Resume
              </button>

              <XIcon
                className='absolute top-4 right-4 cursor-pointer'
                onClick={() => {
                  setShowCreateResume(false)
                  setTitle('')
                }}
              />

            </form>

          </div>
        )}

            {showUploadResume && (
            <div className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center' onClick={()=> setShowUploadResume(false)}>
              <form onSubmit={uploadResume} onClick={e=>e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'>
                <h2 className='text-xl font-bold mb-4'>Upload a Resume</h2>
                <input onChange={(e)=>setTitle(e.target.value)} value={title} type="text" placeholder='Enter resume title' className='w-full px-4 py-2 mb-4 border border-slate-300 rounded focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600' required/>
                <div>
                  <label className="block text-sm text-slate-700">
                    Select resume File
                    <div className='flex flex-col items-center justify-center gap-2 border group text-slate-400 border-slate-400 border-dashed rounded-md p-4 py-10 my-4 hover:border-green-500 hover:text-green-700 cursor-pointer transition-colors'>
                      {resume ? (
                        <p className='text-green-700'>{resume.name}</p>
                      ):(
                        <>
                        <UploadCloud className='size-14 stroke-1'/>
                        <p>Upload resume</p>
                        </>
                      )}
                    </div>
                    <input type="file" id='resume-input' accept='.pdf' className='hidden' onChange={(e)=> setResume(e.target.files[0])}/>
                  </label>
                </div>
                <button disabled={isLoading} className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center justify-center gap-2'>
                  {isLoading && <LoaderCircleIcon className='animate-spin size-4 text-white'/>} 
                  {isLoading ? 'Uploading...' : 'Upload resume'}
                                  
                </button>
                <XIcon className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' onClick={()=>{
                  setShowUploadResume(false); 
                  setTitle(''); 
                  setResume(null)
                }}/>
              </form>
            </div>
          )}

          {/* EDIT RESUME TITLE MODAL */}
          {editResumeId && (
            <div
              className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center'
              onClick={() => {
                setEditResumeId('')
                setTitle('')
              }}
            >
              <form
                onSubmit={editTitle}
                onClick={e => e.stopPropagation()}
                className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6'
              >
                <h2 className='text-xl font-bold mb-4'>Edit Resume Title</h2>

                <input
                  onChange={(e) => setTitle(e.target.value)}
                  value={title}
                  type="text"
                  placeholder='Enter resume title'
                  className='w-full px-4 py-2 mb-4 border rounded'
                  required
                />

                <button className='w-full py-2 bg-blue-600 text-white rounded'>
                  Update Title
                </button>

                <XIcon
                  className='absolute top-4 right-4 cursor-pointer'
                  onClick={() => {
                    setEditResumeId('')
                    setTitle('')
                  }}
                />
              </form>
            </div>
          )}

      </div>
    </div>
  )
}

export default Dashboard