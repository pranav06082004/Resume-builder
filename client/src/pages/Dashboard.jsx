import {
  FilePenLineIcon,
  LoaderCircleIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  UploadCloud,
  UploadCloudIcon,
  XIcon
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../configs/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {
  const { token } = useSelector((state) => state.auth)

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

    if (isLoading) return

    if (!resume) {
      toast.error('Please select a PDF file before uploading.')
      return
    }

    setIsLoading(true)

    try {
      const resumeText = await pdfToText(resume)

      const { data } = await api.post(
        '/api/ai/upload-resume',
        { title, resumeText },
        {
          headers: { Authorization: token },
          timeout: 60000
        }
      )

      toast.success('Resume uploaded successfully')

      setTitle('')
      setResume(null)
      setShowUploadResume(false)

      navi(`/app/builder/${data.resumeId}`)
    } catch (error) {
      console.error('UPLOAD ERROR:', error)

      if (error.code === 'ERR_NETWORK') {
        toast.error('Network issue. Please try again in a few seconds.')
      } else {
        toast.error(
          error?.response?.data?.message ||
            error.message ||
            'Upload failed'
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  // DELETE RESUME
  const deleteResume = async (resumeId) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this resume?'
    )
    if (!confirmDelete) return

    try {
      await api.delete(`/api/resumes/delete/${resumeId}`, {
        headers: { Authorization: token }
      })

      setAllResumes(
        allResumes.filter((resume) => resume._id !== resumeId)
      )
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  // EDIT TITLE
  const editTitle = async (e) => {
    e.preventDefault()

    try {
      const { data } = await api.put(
        `/api/resumes/update`,
        {
          resumeId: editResumeId,
          resumeData: { title }
        },
        {
          headers: {
            Authorization: token
          }
        }
      )

      setAllResumes(
        allResumes.map((resume) =>
          resume._id === editResumeId
            ? { ...resume, title }
            : resume
        )
      )

      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
    } catch (error) {
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
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300'
          >
            <PlusIcon className='size-11 p-2.5 bg-gradient-to-br from-indigo-300 to-indigo-500 text-white rounded-full' />
            <p>Create Resume</p>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300'
          >
            <UploadCloudIcon className='size-11 p-2.5 bg-gradient-to-br from-purple-300 to-purple-500 text-white rounded-full' />
            <p>Upload Existing</p>
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
                className='relative w-full sm:max-w-36 h-48 rounded-lg border'
                style={{
                  background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`
                }}
              >
                <FilePenLineIcon
                  className='size-7'
                  style={{ color: baseColor }}
                />

                <p style={{ color: baseColor }}>{resume.title}</p>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className='absolute top-1 right-1 flex gap-1'
                >
                  <TrashIcon
                    onClick={() => deleteResume(resume._id)}
                    className='size-5 cursor-pointer'
                  />
                  <PencilIcon
                    onClick={() => {
                      setEditResumeId(resume._id)
                      setTitle(resume.title)
                    }}
                    className='size-5 cursor-pointer'
                  />
                </div>
              </button>
            )
          })}
        </div>

        {/* UPLOAD MODAL */}
        {showUploadResume && (
          <div
            className='fixed inset-0 bg-black/70 flex items-center justify-center'
            onClick={() => setShowUploadResume(false)}
          >
            <form
              onSubmit={uploadResume}
              onClick={(e) => e.stopPropagation()}
              className='bg-white p-6 rounded-lg w-full max-w-sm'
            >
              <h2 className='text-xl font-bold mb-4'>
                Upload a Resume
              </h2>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter resume title'
                className='w-full border p-2 rounded mb-4'
                required
              />

              <label
                htmlFor='resume-input'
                className='block cursor-pointer'
              >
                <div className='border border-dashed rounded-md p-6 text-center'>
                  {resume ? resume.name : 'Upload resume PDF'}
                </div>
              </label>

              <input
                id='resume-input'
                type='file'
                accept='.pdf'
                className='hidden'
                onChange={(e) => setResume(e.target.files[0])}
              />

              <button
                type='submit'
                disabled={isLoading}
                className='w-full mt-4 py-2 bg-green-600 text-white rounded'
              >
                {isLoading ? 'Uploading...' : 'Upload Resume'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard