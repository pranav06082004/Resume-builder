import React, { useState } from 'react'
import { Plus, X, Sparkles } from 'lucide-react'

const SkillForm = ({data = [], onChange}) => {
    const[newSkill, setNewSkill] = useState("")

        const addSkill = () => {
            console.log('addSkill called, newSkill:', newSkill);
            const trimmed = newSkill.trim();
            if(!trimmed) {
                // nothing to add
                return;
            }
            if(!data.includes(trimmed)){
                onChange([...(data || []), trimmed])
                setNewSkill("")
            }
        }

        const removeSkill = (indexToRemove) => {
             const updated = data.filter((_, i) => i !== indexToRemove)
             onChange(updated)
        
        }

        const handleKeyPress = (e) => {
            if(e.key === "Enter"){
                addSkill()
            }
        }

  return (
    <div className='space-y-4'>
        <div>
            <h3 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>Skills</h3>
            <p className='text-sm text-gray-500'>Add Your technical and soft skills</p>
        </div>
        <div className='flex gap-2'>
            <input type="text" placeholder="Enter a Skill (e.g., JavaScript, Project Management)" className='flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500' onChange={(e)=> setNewSkill(e.target.value)} value={newSkill} onKeyDown={handleKeyPress} />
            <button onClick={addSkill} className='flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'>
                <Plus className='size-4'/>
                <span>Add</span>
            </button>

        </div>
        {data.length>0 ? (
            <div className='flex flex-wrap gap-2'>
                {data.map((skill, index) => (
                    <span key={index} className='flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm'>
                        {skill}
                        <button onClick={() => removeSkill(index)} className='ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors'>
                            <X className='w-3 h-3'/>
                        </button>
                    </span>

                ))}
            </div>
        ):(
            <div className='text-center py-6 text-gray-500'>
                <Sparkles className='w-10 h-10 mx-auto mb-2 text-gray-300'/>
                <p>Add Your technical and soft skills above</p>
            </div>
        )}

        <div className='bg-blue-50 p-3 rounded-lg'>
            <p className='text-sm text-blue-800'><strong>Tip:</strong>Add 8-12 relevant skills, Include both technical skills (programming languages, frameworks, tools) and soft skills (communication, leadership).</p>
        </div>

    </div>
  )
}

export default SkillForm