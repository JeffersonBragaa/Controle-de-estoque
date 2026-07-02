import { v4 as uuidv4 } from 'uuid';

import * as LocalizacaoRepository from '@/repository/localizacaoRepository';
import type {
  ApiResponse,
  Local,
  Corredor,
  Gaveta,
  LocalFormData,
  CorredorFormData,
  GavetaFormData,
} from '@/types';

// ============================================================
// Locais
// ============================================================

export async function cadastrarLocal(
  dados: LocalFormData,
): Promise<ApiResponse<Local>> {
  try {
    if (!dados.nome?.trim()) {
      return { success: false, message: 'O nome do local é obrigatório.' };
    }

    const duplicado = await LocalizacaoRepository.buscarLocalPorNome(dados.nome);
    if (duplicado) {
      return {
        success: false,
        message: 'Já existe um local cadastrado com este nome.',
      };
    }

    const novoLocal: Local = {
      id: uuidv4(),
      nome: dados.nome.trim(),
    };

    await LocalizacaoRepository.salvarLocal(novoLocal);

    return {
      success: true,
      message: 'Local cadastrado com sucesso.',
      data: novoLocal,
    };
  } catch {
    return { success: false, message: 'Erro ao cadastrar o local.' };
  }
}

export async function atualizarLocal(
  id: string,
  dados: LocalFormData,
): Promise<ApiResponse<Local>> {
  try {
    const localExistente = await LocalizacaoRepository.buscarLocalPorId(id);
    if (!localExistente) {
      return { success: false, message: 'Local não encontrado.' };
    }

    if (!dados.nome?.trim()) {
      return { success: false, message: 'O nome do local é obrigatório.' };
    }

    const duplicado = await LocalizacaoRepository.buscarLocalPorNome(dados.nome);
    if (duplicado && duplicado.id !== id) {
      return {
        success: false,
        message: 'Já existe outro local cadastrado com este nome.',
      };
    }

    const localAtualizado: Local = {
      ...localExistente,
      nome: dados.nome.trim(),
    };

    await LocalizacaoRepository.atualizarLocal(localAtualizado);

    return {
      success: true,
      message: 'Local atualizado com sucesso.',
      data: localAtualizado,
    };
  } catch {
    return { success: false, message: 'Erro ao atualizar o local.' };
  }
}

export async function excluirLocal(id: string): Promise<ApiResponse> {
  try {
    const local = await LocalizacaoRepository.buscarLocalPorId(id);
    if (!local) {
      return { success: false, message: 'Local não encontrado.' };
    }

    const totalCorredores = await LocalizacaoRepository.contarCorredoresPorLocal(id);
    if (totalCorredores > 0) {
      return {
        success: false,
        message: `Não é possível excluir o local "${local.nome}" porque ele possui ${totalCorredores} corredor(es) vinculado(s). Remova os corredores antes de excluir o local.`,
      };
    }

    const totalProdutos = await LocalizacaoRepository.contarProdutosPorLocal(local.nome);
    if (totalProdutos > 0) {
      return {
        success: false,
        message: `Não é possível excluir o local "${local.nome}" porque ele está sendo utilizado por ${totalProdutos} produto(s).`,
      };
    }

    await LocalizacaoRepository.excluirLocal(id);

    return { success: true, message: 'Local removido com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao excluir o local.' };
  }
}

export async function buscarTodosLocais(): Promise<ApiResponse<Local[]>> {
  try {
    const locais = await LocalizacaoRepository.listarLocais();
    return {
      success: true,
      message: 'Locais carregados com sucesso.',
      data: locais,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar os locais.' };
  }
}

// ============================================================
// Corredores
// ============================================================

export async function cadastrarCorredor(
  dados: CorredorFormData,
): Promise<ApiResponse<Corredor>> {
  try {
    if (!dados.nome?.trim()) {
      return { success: false, message: 'O nome do corredor é obrigatório.' };
    }
    if (!dados.localId?.trim()) {
      return { success: false, message: 'O local do corredor é obrigatório.' };
    }

    const duplicado = await LocalizacaoRepository.buscarCorredorPorNomeELocal(dados.nome, dados.localId);
    if (duplicado) {
      return {
        success: false,
        message: 'Já existe um corredor com este nome neste local.',
      };
    }

    const novoCorredor: Corredor = {
      id: uuidv4(),
      nome: dados.nome.trim(),
      localId: dados.localId,
    };

    await LocalizacaoRepository.salvarCorredor(novoCorredor);

    return {
      success: true,
      message: 'Corredor cadastrado com sucesso.',
      data: novoCorredor,
    };
  } catch {
    return { success: false, message: 'Erro ao cadastrar o corredor.' };
  }
}

export async function atualizarCorredor(
  id: string,
  dados: CorredorFormData,
): Promise<ApiResponse<Corredor>> {
  try {
    const corredorExistente = await LocalizacaoRepository.buscarCorredorPorId(id);
    if (!corredorExistente) {
      return { success: false, message: 'Corredor não encontrado.' };
    }

    if (!dados.nome?.trim()) {
      return { success: false, message: 'O nome do corredor é obrigatório.' };
    }
    if (!dados.localId?.trim()) {
      return { success: false, message: 'O local do corredor é obrigatório.' };
    }

    const duplicado = await LocalizacaoRepository.buscarCorredorPorNomeELocal(dados.nome, dados.localId);
    if (duplicado && duplicado.id !== id) {
      return {
        success: false,
        message: 'Já existe outro corredor com este nome neste local.',
      };
    }

    const corredorAtualizado: Corredor = {
      ...corredorExistente,
      nome: dados.nome.trim(),
      localId: dados.localId,
    };

    await LocalizacaoRepository.atualizarCorredor(corredorAtualizado);

    return {
      success: true,
      message: 'Corredor atualizado com sucesso.',
      data: corredorAtualizado,
    };
  } catch {
    return { success: false, message: 'Erro ao atualizar o corredor.' };
  }
}

export async function excluirCorredor(id: string): Promise<ApiResponse> {
  try {
    const corredor = await LocalizacaoRepository.buscarCorredorPorId(id);
    if (!corredor) {
      return { success: false, message: 'Corredor não encontrado.' };
    }

    const totalGavetas = await LocalizacaoRepository.contarGavetasPorCorredor(id);
    if (totalGavetas > 0) {
      return {
        success: false,
        message: `Não é possível excluir o corredor "${corredor.nome}" porque ele possui ${totalGavetas} gaveta(s) vinculada(s). Remova as gavetas antes de excluir o corredor.`,
      };
    }

    const totalProdutos = await LocalizacaoRepository.contarProdutosPorCorredor(corredor.nome);
    if (totalProdutos > 0) {
      return {
        success: false,
        message: `Não é possível excluir o corredor "${corredor.nome}" porque ele está sendo utilizado por ${totalProdutos} produto(s).`,
      };
    }

    await LocalizacaoRepository.excluirCorredor(id);

    return { success: true, message: 'Corredor removido com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao excluir o corredor.' };
  }
}

export async function buscarTodosCorredores(): Promise<ApiResponse<Corredor[]>> {
  try {
    const corredores = await LocalizacaoRepository.listarCorredores();
    return {
      success: true,
      message: 'Corredores carregados com sucesso.',
      data: corredores,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar os corredores.' };
  }
}

export async function buscarCorredoresPorLocal(localId: string): Promise<ApiResponse<Corredor[]>> {
  try {
    const corredores = await LocalizacaoRepository.listarCorredoresPorLocal(localId);
    return {
      success: true,
      message: 'Corredores carregados com sucesso.',
      data: corredores,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar os corredores.' };
  }
}

// ============================================================
// Gavetas
// ============================================================

export async function cadastrarGaveta(
  dados: GavetaFormData,
): Promise<ApiResponse<Gaveta>> {
  try {
    if (!dados.nome?.trim()) {
      return { success: false, message: 'O nome da gaveta é obrigatório.' };
    }
    if (!dados.corredorId?.trim()) {
      return { success: false, message: 'O corredor da gaveta é obrigatório.' };
    }

    const duplicado = await LocalizacaoRepository.buscarGavetaPorNomeECorredor(dados.nome, dados.corredorId);
    if (duplicado) {
      return {
        success: false,
        message: 'Já existe uma gaveta com este nome neste corredor.',
      };
    }

    const novaGaveta: Gaveta = {
      id: uuidv4(),
      nome: dados.nome.trim(),
      corredorId: dados.corredorId,
    };

    await LocalizacaoRepository.salvarGaveta(novaGaveta);

    return {
      success: true,
      message: 'Gaveta cadastrada com sucesso.',
      data: novaGaveta,
    };
  } catch {
    return { success: false, message: 'Erro ao cadastrar a gaveta.' };
  }
}

export async function atualizarGaveta(
  id: string,
  dados: GavetaFormData,
): Promise<ApiResponse<Gaveta>> {
  try {
    const gavetaExistente = await LocalizacaoRepository.buscarGavetaPorId(id);
    if (!gavetaExistente) {
      return { success: false, message: 'Gaveta não encontrada.' };
    }

    if (!dados.nome?.trim()) {
      return { success: false, message: 'O nome da gaveta é obrigatório.' };
    }
    if (!dados.corredorId?.trim()) {
      return { success: false, message: 'O corredor da gaveta é obrigatório.' };
    }

    const duplicado = await LocalizacaoRepository.buscarGavetaPorNomeECorredor(dados.nome, dados.corredorId);
    if (duplicado && duplicado.id !== id) {
      return {
        success: false,
        message: 'Já existe outra gaveta com este nome neste corredor.',
      };
    }

    const gavetaAtualizada: Gaveta = {
      ...gavetaExistente,
      nome: dados.nome.trim(),
      corredorId: dados.corredorId,
    };

    await LocalizacaoRepository.atualizarGaveta(gavetaAtualizada);

    return {
      success: true,
      message: 'Gaveta atualizada com sucesso.',
      data: gavetaAtualizada,
    };
  } catch {
    return { success: false, message: 'Erro ao atualizar a gaveta.' };
  }
}

export async function excluirGaveta(id: string): Promise<ApiResponse> {
  try {
    const gaveta = await LocalizacaoRepository.buscarGavetaPorId(id);
    if (!gaveta) {
      return { success: false, message: 'Gaveta não encontrada.' };
    }

    const totalProdutos = await LocalizacaoRepository.contarProdutosPorGaveta(gaveta.nome);
    if (totalProdutos > 0) {
      return {
        success: false,
        message: `Não é possível excluir a gaveta "${gaveta.nome}" porque ela está sendo utilizada por ${totalProdutos} produto(s).`,
      };
    }

    await LocalizacaoRepository.excluirGaveta(id);

    return { success: true, message: 'Gaveta removida com sucesso.' };
  } catch {
    return { success: false, message: 'Erro ao excluir a gaveta.' };
  }
}

export async function buscarTodasGavetas(): Promise<ApiResponse<Gaveta[]>> {
  try {
    const gavetas = await LocalizacaoRepository.listarGavetas();
    return {
      success: true,
      message: 'Gavetas carregadas com sucesso.',
      data: gavetas,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar as gavetas.' };
  }
}

export async function buscarGavetasPorCorredor(corredorId: string): Promise<ApiResponse<Gaveta[]>> {
  try {
    const gavetas = await LocalizacaoRepository.listarGavetasPorCorredor(corredorId);
    return {
      success: true,
      message: 'Gavetas carregadas com sucesso.',
      data: gavetas,
    };
  } catch {
    return { success: false, message: 'Erro ao carregar as gavetas.' };
  }
}
