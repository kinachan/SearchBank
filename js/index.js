let rootPath;

const getRootPath = () => {
  rootPath = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/'));
}

const readBanks = async () => {
  const res = await fetch(`${rootPath}/data/banks.json`);
  return res.json();
}

const readBranch = async (code) => {
  const url = `${rootPath}/data/branches/${code}.json`;
  let res;
  try {
    res = await fetch(url);
  } catch (ignore) {} 
  if (res.ok) return res.json();
  return null;
};

const readBranchByKey = async (filteredBanks) => {
  for (let bank of filteredBanks) {
    const code = bank.code;
    const branch = await readBranch(code);
    if (branch) bank.branch = branch;
  }
  return filteredBanks;
}

const searchBank = async (condition) => {
  const code = condition.bankCode;
  const name = condition.bankName;

  const banks = await readBanks();
  let results = [];
  Object.keys(banks).forEach((bankCode) => {
    const bank = banks[bankCode];
    if ((bankCode.includes(code) || !code) &&
      (bank.name.includes(name) || !name)
    ) {
      results.push(bank);
    }
  });
  return results;
};

const searchBranch = (condition, filteredBanks) => {
  const branchCode = condition.branchCode;
  const name = condition.branchName;

  filteredBanks.forEach((bank) => {
    let results = [];
    //  branch階層
    const branchesCode = Object.keys(bank.branch || []);
    branchesCode.forEach((bCode) => {
      const branch = bank.branch[bCode];
      if (
        (bCode.includes(branchCode) || !branchCode) &&
        (branch.name.includes(name) || !name)
      )  {
        results.push(branch);
      }
    });
    bank.branch = results;
  });
  return filteredBanks;
};

const setTableObject = (bank, branch) => {
  const format = {
    code: bank.code,
    name: bank.name,
    branch: '',
    branchCode: '',
  };
  if (branch) {
    format.branch = branch.name;
    format.branchCode = branch.code;
  }
  return format;
}

//  #	銀行コード	銀行名	支店名	支店番号
const createObjectsForTable = (banks) => {
  let result = [];
  banks.forEach((bank) => {
    bank.branch.forEach((branch) => {
      const data = setTableObject(bank, branch);
      result.push(data);
    });
  });
  return result;
};

const renderTableData = (oneData) => {
  let result = '';
  Object.keys(oneData).forEach((key) => {
    result += `
      <td>${oneData[key]}</td>
    `});
  return result;
}

const renderTable = (data) => {
  const body = document.getElementById('table-data');
  body.innerHTML = '';
  let stringData = '';
  stringData += data.map((oneData) => {
    return `<tr>${renderTableData(oneData)}</tr>`;
  }).join('');
  body.insertAdjacentHTML( 'beforeend', stringData );
}

const escapeHtml = (data) => {
  if (!data) return data;
  if (typeof data != 'string') return data;

  data = data.replace(/&/g, '&amp;');
  data = data.replace(/</g, '&lt;');
  data = data.replace(/>/g, '&gt;');
  data = data.replace(/"/g, '&quot;');
  data = data.replace(/'/g, '&#39;');
  return data;
}

const setCondition = () => {
  const bankCodeElem = document.getElementById('bankCode');
  const branchCodeElem = document.getElementById('branchCode');

  const bankNameElem = document.getElementById('bankName');
  const branchNameElem = document.getElementById('branchName');

  const bankCode = escapeHtml(bankCodeElem.value).trim();
  const branchCode = escapeHtml(branchCodeElem.value).trim();
  const bankName = escapeHtml(bankNameElem.value).trim();
  const branchName = escapeHtml(branchNameElem.value).trim();

  const condition = {bankCode, branchCode, bankName, branchName};
  return condition;
}

const hideLoader = () => {
  const loader = document.getElementById('loader');
  loader.classList.add('loader-is-visible');
}

const removeLoader = () => {
  const loader = document.getElementById('loader');
  loader.classList.remove('loader-is-visible');
}

const searchHandle = async (ev) => {
  ev.preventDefault();
  hideLoader();
  const searchResult = await search();
  const tableData = createObjectsForTable(searchResult);

  renderTable(tableData);
  removeLoader();  
}

const search = async () => {
  const condition = setCondition();
  const banks = await searchBank(condition);
  await readBranchByKey(banks);

  const results = searchBranch(condition, banks);
  return results;
}

let searchButton;
const onLoad = () => {
  getRootPath();
  searchButton = document.getElementById('search');
  searchButton.addEventListener('click', searchHandle, false);
}

onLoad();

