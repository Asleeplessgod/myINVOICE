// ---- LOGO UPLOAD PREVIEW ----

function attachLogoListener() {
  document.getElementById('companyLogo').addEventListener('change', function () {
    const file = this.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = function (e) {
        const logoUpload = document.querySelector('.logo-upload')
        logoUpload.innerHTML = `<img src="${e.target.result}" alt="Company logo" style="max-height: 80px; max-width: 200px; object-fit: contain;">`
      }
      reader.readAsDataURL(file)
    }
  })
}

attachLogoListener()


// ---- ITEMS TABLE ----

document.querySelector('.add-item-btn').addEventListener('click', function () {
  const tbody = document.getElementById('items-body')
  const tr = document.createElement('tr')
  tr.innerHTML = `
    <td><input type="text" placeholder="Service or product"></td>
    <td><input type="number" value="1" min="1"></td>
    <td><input type="number" value="0" min="0" placeholder="0.00"></td>
    <td class="row-total">₦0</td>
    <td><button class="del-btn">✕</button></td>
  `
  tbody.appendChild(tr)
  attachRowListeners(tr)
})

function deleteRow(btn) {
  const rows = document.querySelectorAll('#items-body tr')
  if (rows.length > 1) {
    btn.closest('tr').remove()
    calcTotals()
  }
}

function calcTotals() {
  let subtotal = 0
  document.querySelectorAll('#items-body tr').forEach(function (row) {
    const qty = parseFloat(row.querySelector('td:nth-child(2) input').value) || 0
    const price = parseFloat(row.querySelector('td:nth-child(3) input').value) || 0
    const rowTotal = qty * price
    row.querySelector('.row-total').textContent = '₦' + rowTotal.toLocaleString()
    subtotal += rowTotal
  })
  document.getElementById('subtotal').textContent = '₦' + subtotal.toLocaleString()
  document.getElementById('total').textContent = '₦' + subtotal.toLocaleString()
}

function attachRowListeners(row) {
  row.querySelector('td:nth-child(2) input').addEventListener('input', calcTotals)
  row.querySelector('td:nth-child(3) input').addEventListener('input', calcTotals)
  row.querySelector('.del-btn').addEventListener('click', function () {
    deleteRow(this)
  })
}

attachRowListeners(document.querySelector('#items-body tr'))


// ---- SIDEBAR NAVIGATION ----

document.querySelectorAll('.nav-item[data-view]').forEach(function (link) {
  link.addEventListener('click', function (e) {
    e.preventDefault()
    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.classList.remove('active')
    })
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.remove('active')
    })
    this.classList.add('active')
    const viewId = 'view-' + this.dataset.view
    document.getElementById(viewId).classList.add('active')
    if (this.dataset.view === 'invoices') renderInvoices()
  })
})


// ---- INVOICES LIST ----

let invoices = []
let editingIndex = null
let currentSort = 'date'

document.querySelector('.btn-outline').addEventListener('click', function () {
  saveInvoice('Draft')
})

document.querySelector('.btn-primary').addEventListener('click', function () {
  saveInvoice('Pending')
})

function saveInvoice(status) {
  const client = document.getElementById('clientName').value.trim()
  const bizName = document.getElementById('bizName').value.trim()
  const due = document.getElementById('dueDate').value
  const total = document.getElementById('total').textContent

  if (!bizName) {
    alert('Please enter your business name.')
    return
  }
  if (!client) {
    alert('Please enter a client name.')
    return
  }
  if (!due) {
    alert('Please select a due date.')
    return
  }
  if (total === '₦0') {
    alert('Please add at least one item with a price.')
    return
  }

  if (editingIndex !== null) {
    invoices[editingIndex].client = client
    invoices[editingIndex].total = total
    invoices[editingIndex].due = due
    editingIndex = null
    document.querySelector('#view-create .page-title').textContent = 'Create invoice'
    document.querySelector('.btn-primary').textContent = 'Send invoice'
    alert('Invoice updated!')
  } else {
    invoices.unshift({
      client: client,
      total: total,
      due: due,
      status: status,
      id: 'INV-00' + (invoices.length + 1)
    })
    alert('Invoice saved as ' + status + '!')
  }

  clearForm()
}

function clearForm() {
  document.getElementById('bizName').value = ''
  document.getElementById('bizEmail').value = ''
  document.getElementById('bizAddress').value = ''
  document.getElementById('clientName').value = ''
  document.getElementById('clientEmail').value = ''
  document.getElementById('dueDate').value = ''
  document.getElementById('invoiceNumber').value = 'INV-00' + (invoices.length + 1)

  document.getElementById('items-body').innerHTML = `
    <tr>
      <td><input type="text" placeholder="Service or product"></td>
      <td><input type="number" value="1" min="1"></td>
      <td><input type="number" value="0" min="0" placeholder="0.00"></td>
      <td class="row-total">₦0</td>
      <td><button class="del-btn">✕</button></td>
    </tr>
  `
  attachRowListeners(document.querySelector('#items-body tr'))

  document.getElementById('subtotal').textContent = '₦0'
  document.getElementById('total').textContent = '₦0'

  document.querySelector('.logo-upload').innerHTML = `
    <input type="file" accept="image/*" id="companyLogo" hidden>
    <p>Click to upload your logo</p>
  `
  attachLogoListener()
}

function renderInvoices() {
  const list = document.getElementById('invoice-list')
  document.getElementById('stat-total').textContent = invoices.length
  document.getElementById('stat-paid').textContent = invoices.filter(i => i.status === 'Paid').length
  document.getElementById('stat-pending').textContent = invoices.filter(i => i.status === 'Pending').length

  if (invoices.length === 0) {
    list.innerHTML = '<p class="empty-state">No invoices yet. Create your first one.</p>'
    return
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  list.innerHTML = invoices.map(function (inv, index) {
    const dueDate = new Date(inv.due)
    const isOverdue = inv.due !== 'No date' && dueDate < today && inv.status !== 'Paid'
    const badgeClass = isOverdue ? 'overdue' : inv.status.toLowerCase()
    const badgeLabel = isOverdue ? 'Overdue' : inv.status
    const rowClass = isOverdue ? 'invoice-row overdue-row' : 'invoice-row'

    return `
      <div class="${rowClass}">
        <span>${inv.client}</span>
        <span>${inv.total}</span>
        <span>${inv.due}</span>
        <span><span class="badge ${badgeClass}">${badgeLabel}</span></span>
        <span class="row-actions">
          <button onclick="markPaid(${index})">Paid</button>
          <button onclick="editInvoice(${index})">Edit</button>
          <button onclick="deleteInvoice(${index})">Delete</button>
        </span>
      </div>
    `
  }).join('')
}

function markPaid(index) {
  invoices[index].status = 'Paid'
  renderInvoices()
}

function editInvoice(index) {
  const inv = invoices[index]
  editingIndex = index

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'))
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.querySelector('.nav-item[data-view="create"]').classList.add('active')
  document.getElementById('view-create').classList.add('active')

  document.getElementById('clientName').value = inv.client
  document.getElementById('dueDate').value = inv.due
  document.getElementById('invoiceNumber').value = inv.id

  document.querySelector('#view-create .page-title').textContent = 'Edit invoice'
  document.querySelector('.btn-primary').textContent = 'Update invoice'
}

function deleteInvoice(index) {
  invoices.splice(index, 1)
  renderInvoices()
}

function sortInvoices(type) {
  currentSort = type

  document.querySelectorAll('.sort-btn').forEach(function (btn) {
    btn.classList.remove('active')
  })
  event.target.classList.add('active')

  if (type === 'date') {
    invoices.sort(function (a, b) {
      return new Date(b.due) - new Date(a.due)
    })
  } else if (type === 'amount') {
    invoices.sort(function (a, b) {
      const aNum = parseFloat(a.total.replace(/[^0-9.]/g, '')) || 0
      const bNum = parseFloat(b.total.replace(/[^0-9.]/g, '')) || 0
      return bNum - aNum
    })
  }

  renderInvoices()
}


// ---- INVOICE PREVIEW ----

document.querySelector('.btn-preview').addEventListener('click', function () {
  showPreview()
})

document.getElementById('closeModal').addEventListener('click', function () {
  document.getElementById('previewModal').classList.remove('active')
})

document.getElementById('closeModalBtn').addEventListener('click', function () {
  document.getElementById('previewModal').classList.remove('active')
})

function showPreview() {
  const bizName = document.getElementById('bizName').value || 'Your Business'
  const bizEmail = document.getElementById('bizEmail').value || ''
  const bizAddress = document.getElementById('bizAddress').value || ''
  const clientName = document.getElementById('clientName').value || 'Client'
  const clientEmail = document.getElementById('clientEmail').value || ''
  const invoiceNumber = document.getElementById('invoiceNumber').value || 'INV-001'
  const dueDate = document.getElementById('dueDate').value || 'No date'

  const logoUpload = document.querySelector('.logo-upload img')
  const logoHTML = logoUpload
    ? `<img src="${logoUpload.src}" class="preview-logo" alt="logo">`
    : `<h3 style="font-size:1.2rem"><span style="color:orangered">my</span><span style="color:blue">INVOICE</span></h3>`

  let itemsHTML = ''
  let subtotal = 0

  document.querySelectorAll('#items-body tr').forEach(function (row) {
    const desc = row.querySelector('td:nth-child(1) input').value || '-'
    const qty = parseFloat(row.querySelector('td:nth-child(2) input').value) || 0
    const price = parseFloat(row.querySelector('td:nth-child(3) input').value) || 0
    const rowTotal = qty * price
    subtotal += rowTotal
    itemsHTML += `
      <tr>
        <td>${desc}</td>
        <td>${qty}</td>
        <td>₦${price.toLocaleString()}</td>
        <td>₦${rowTotal.toLocaleString()}</td>
      </tr>
    `
  })

  document.getElementById('previewContent').innerHTML = `
    <div class="preview-header">
      <div>${logoHTML}</div>
      <div class="preview-invoice-info">
        <h2>${invoiceNumber}</h2>
        <p>Due date: ${dueDate}</p>
      </div>
    </div>
    <div class="preview-parties">
      <div>
        <h4>From</h4>
        <p><strong>${bizName}</strong><br>${bizEmail}<br>${bizAddress}</p>
      </div>
      <div>
        <h4>To</h4>
        <p><strong>${clientName}</strong><br>${clientEmail}</p>
      </div>
    </div>
    <table class="preview-table">
      <thead>
        <tr>
          <th>Description</th>
          <th>Qty</th>
          <th>Unit price</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>${itemsHTML}</tbody>
    </table>
    <div class="preview-totals">
      <div>Subtotal: ₦${subtotal.toLocaleString()}</div>
      <div class="preview-grand">Total: ₦${subtotal.toLocaleString()}</div>
    </div>
  `

  document.getElementById('previewModal').classList.add('active')
}


// ---- PDF DOWNLOAD ----

document.getElementById('downloadBtn').addEventListener('click', function () {
  const content = document.getElementById('previewContent')

  const options = {
    margin: 10,
    filename: document.getElementById('invoiceNumber').value + '.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().set(options).from(content).save()
})


// ---- SETTINGS ----

let settings = {
  bizName: '',
  bizEmail: '',
  bizAddress: '',
  prefix: 'INV',
  currency: '₦',
  tax: 0
}

document.getElementById('settingTax').addEventListener('input', function () {
  const tax = parseFloat(this.value) || 0
  const preview = document.getElementById('taxPreview')
  if (tax === 0) {
    preview.textContent = '0% — no tax applied'
  } else {
    preview.textContent = tax + '% will be added to invoice total'
  }
})

document.getElementById('saveSettingsBtn').addEventListener('click', function () {
  const bizName = document.getElementById('settingBizName').value.trim()
  const bizEmail = document.getElementById('settingBizEmail').value.trim()

  if (!bizName) {
    alert('Please enter your business name.')
    return
  }
  if (!bizEmail) {
    alert('Please enter your business email.')
    return
  }

  settings.bizName = bizName
  settings.bizEmail = bizEmail
  settings.bizAddress = document.getElementById('settingBizAddress').value.trim()
  settings.prefix = document.getElementById('settingPrefix').value.trim() || 'INV'
  settings.currency = document.getElementById('settingCurrency').value
  settings.tax = parseFloat(document.getElementById('settingTax').value) || 0

  document.getElementById('bizName').value = settings.bizName
  document.getElementById('bizEmail').value = settings.bizEmail
  document.getElementById('bizAddress').value = settings.bizAddress
  document.getElementById('invoiceNumber').value = settings.prefix + '-001'

  alert('Settings saved!')
})