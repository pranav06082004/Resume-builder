import api from '../configs/api'
import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon, GraduationCap, Share2Icon, Sparkle, Sparkles, User } from 'lucide-react'
import PersonalInfoForm from '../Components/PersonalInfoForm'
import ProfessionalSummaryForm from '../Components/professionalSummaryForm'
import ExperinceForm from '../Components/ExperinceForm'
import EducationForm from '../Components/EducationForm'
import ProjectForm from '../Components/ProjectForm'
import SkillForm from '../Components/SkillForm'
import ResumePreview from '../Components/resumePreview'
import TemplateSelector from '../Components/templateSelector.jsx'
import ColorPicker from '../Components/Colorpicker'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'



const ResumeBuilder = () => {

  const params = useParams()
  const resumeId = params.resume || params.id || params.resumeId || Object.values(params)[0]
  const {token} = useSelector(state => state.auth)

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: '',
    personal_info:{},
    professional_summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: [],
    template:"classic",
    accent_color: '#3B82F6',
    public: false,
    
  })
  

  const loadExistingResume = async () => {
  try{

    const {data} = await api.get(
      '/api/resumes/get/' + resumeId,
      {
        headers:{
          Authorization: token
        }
      }
    )

    if(data.resume){
      setResumeData(data.resume)
      setRemoveBackground(data.resume.remove_background || false)
      document.title = data.resume.title
    }

  }
  catch(error){
    console.log(error)
  }
}

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBackground, setRemoveBackground] = useState(false);

  const sections=[
    {id:"personal", name:"Personal Info", icon: User},
    {id:"summary", name:"Summary", icon: FileText},
    {id:"experience", name:"Experience", icon: Briefcase},
    {id:"education", name:"Education", icon: GraduationCap},
    {id:"projects", name:"Projects", icon: FolderIcon},
    {id:"skills", name:"Skills", icon: Sparkles},
  ]

  const activeSection= sections[activeSectionIndex]

 useEffect(() => {
    loadExistingResume()
}, [])

  const changeResumeVisibility=async()=>{
    try{
      const formData = new FormData()
      formData.append("resumeId", resumeId)
      formData.append("resumeData", JSON.stringify({public: !resumeData.public}))

      const {data} = await api.put(
      '/api/resumes/update/', formData,
      {headers:{Authorization: token
      }})
      setResumeData({...resumeData, public: !resumeData.public})
      toast.success(data.message)
    }
    catch(error){
      console.error("Error saving resume", error)
    }
  }

  const handleShare=()=>{
    const frontendUrl = window.location.href.split('/app')[0]
    const resumeUrl= frontendUrl + '/view/' + resumeId;

    if(navigator.share){
      navigator.share({url: resumeUrl,text: "My Resume",})
    }
      else{
        alert('Share not supported on this browser')
      }
  }

  const downloadResume=()=>{
    window.print();
  }

  const saveResume =async ()=>{
    try{
      let updateResumeData = structuredClone(resumeData)
      updateResumeData.remove_background = removeBackground

      if(typeof resumeData.personal_info.image ==='object'){
        delete updateResumeData.personal_info.image
      }
      const formData =new FormData();
      formData.append("resumeId",resumeId)
      formData.append("resumeData", JSON.stringify(updateResumeData))
      removeBackground && formData.append("removeBackground", "yes")
      typeof resumeData.personal_info.image ==='object' && formData.append("image", resumeData.personal_info.image)
      const {data}=await api.put('/api/resumes/update', formData, {headers:{
        Authorization: token
      }})
      setResumeData(data.resume)
      toast.success(data.message)
    }
    catch(error){
      console.error("Error saving resume", error)
    }
  }

  return (
    <div>

      <div>
        <Link to={'/app'} className='inline-flex gap-2 items-center text-slate-500 hover: text-slate-700 transition-all'>
          <ArrowLeftIcon className='size-4'/> Back to dashboard 
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* left panel -form */}
          <div className='relative lg:col-span-5 rounded-lg overflow-hidden min-h-[600px]'>
             <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-h-[600px] overflow-y-auto'>
              {/* progress bar */}
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200' />
              <hr  className='absolute top-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-600 border-none transition-all duration-2000'
              style={{width:`${(activeSectionIndex * 100) / (sections.length - 1)}%`}}/>
              {/* section navigator */}
              <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1'>
                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(templateId) => setResumeData(prev => ({...prev, template: templateId}))}/>
                    <ColorPicker selectedColor={resumeData.accent_color} onChange={(color) => setResumeData(prev => ({...prev, accent_color: color}))}/>
                </div>
                <div className='flex items-center'>
                  {activeSectionIndex !==0 && (
                    <button onClick={()=> setActiveSectionIndex((prevIndex)=>{
                        const next = Math.max(prevIndex -1, 0);
                        console.log('go previous from', prevIndex, 'to', next);
                        return next;
                    })} className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all' disabled={activeSectionIndex===0}>
                      <ChevronLeft className='size-4'/> Previous
                    </button>
                  )}
                   <button onClick={()=> setActiveSectionIndex((prevIndex)=>{
                        const next = Math.min(prevIndex + 1, sections.length - 1);
                        console.log('go next from', prevIndex, 'to', next);
                        return next;
                   })} className={`flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all ${activeSectionIndex===sections.length - 1 && 'opacity-50'}`} disabled={activeSectionIndex===sections.length - 1}>
                      Next <ChevronRight className='size-4'/> 
                    </button>
                </div>

              </div>
               {/* section form */}
              <div className='mb-4 text-center text-sm font-medium text-gray-700'>Active section: {activeSection.name}</div>
              <div className='space-y-6'>
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm data={resumeData.personal_info} onChange={(data)=> setResumeData(prev => ({...prev, personal_info: data}))} removeBackground={removeBackground} setRemoveBackground={setRemoveBackground}/>
                  )}
                  {
                    activeSection.id === 'summary' && (
                      <ProfessionalSummaryForm data={resumeData.professional_summary} onChange={(data)=> setResumeData(prev => ({...prev, professional_summary: data}))} setResumeData={setResumeData}/>
                    )
                  }
                  {
                    activeSection.id === 'experience' && (
                      <ExperinceForm data={resumeData.experience} onChange={(data)=> setResumeData(prev => ({...prev, experience: data}))} />
                  
                    )
                  }
                  {
                    activeSection.id === 'education' && (
                      <EducationForm data={resumeData.education} onChange={(data)=> setResumeData(prev => ({...prev, education: data}))} />
                  
                    )
                  }
                  {
                    activeSection.id === 'projects' && (
                      <ProjectForm data={resumeData.projects} onChange={(data)=> setResumeData(prev => ({...prev, projects: data}))} />
                  
                    )
                  }
                  {
                    activeSection.id === 'skills' && (
                      <SkillForm data={resumeData.skills} onChange={(data)=> setResumeData(prev => ({...prev, skills: data}))} />
                  
                    )
                  }

              </div>
              <button onClick={()=> {toast.promise(saveResume, {loading: 'Saving...'})}} className='bg-gradient-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm'>
                Save Changes
              </button>
             </div>

          </div>
          
          {/* right panel - preview */}
          <div className='lg:col-span-7 max-lg:mt-6 min-h-[600px]'>
            <div className='relative w-full'>
              <div className='absolute top-3 right-3 flex flex-wrap items-center justify-end gap-2 p-2 z-10'>
                {resumeData.public && (
                  <button onClick={handleShare} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                    <Share2Icon className='size-4'/> Share
                  </button>
                )}
                <button onClick={changeResumeVisibility} className='flex items-center p-2 px-4 gap-2 text-xs bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600 rounded-lg ring-purple-300 hover:ring transition-colors'>
                  {resumeData.public ? <EyeIcon className='size-4'/>: <EyeOffIcon className='size-4'/>}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                 <button onClick={downloadResume} className='flex items-center gap-2 px-6 py-2 text-xs bg-gradient-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                  <DownloadIcon className='size-4'/> Download
                </button>
                </div>
            </div>
              <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} removeBackground={removeBackground}/>
              
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder