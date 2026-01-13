import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Vítejte v Daramis Admin</h4>
      </Banner>
      <div style={{ marginTop: '1rem' }}>
        <strong>Rychlý přehled:</strong>
        <ul className={`${baseClass}__instructions`}>
          <li>
            <strong>Projekty</strong> - Spravujte developerské projekty a jejich lokace
          </li>
          <li>
            <strong>Jednotky</strong> - Konfigurujte bytové jednotky a jejich parametry
          </li>
          <li>
            <strong>Galerie</strong> - Nahrávejte a organizujte média projektů
          </li>
          <li>
            <strong>Body zájmu</strong> - Definujte POI v okolí projektů
          </li>
        </ul>
      </div>
    </div>
  )
}

export default BeforeDashboard
